import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// 返回某周的 [startDate, endDate]（周一到周日）
export function getWeekRange(offset = 0) {
  const now = new Date()
  const day = now.getDay() || 7  // 把周日的 0 改成 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - day + 1 + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return [monday, sunday]
}

export function toDateStr(date) {
  return date.toISOString().slice(0, 10)
}

export function useMenu(weekOffset = 0) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  const [start, end] = getWeekRange(weekOffset)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('menu_plans')
      .select('*, recipe:recipes(id, name, image_url)')
      .gte('date', toDateStr(start))
      .lte('date', toDateStr(end))
    setPlans(data ?? [])
    setLoading(false)
  }, [weekOffset])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  async function setPlan(date, mealType, recipeId) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: member } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    await supabase.from('menu_plans').upsert({
      family_id: member.family_id,
      date,
      meal_type: mealType,
      recipe_id: recipeId,
      created_by: user.id,
    }, { onConflict: 'family_id,date,meal_type' })

    await fetchPlans()
  }

  async function clearPlan(date, mealType) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: member } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    await supabase.from('menu_plans')
      .delete()
      .eq('family_id', member.family_id)
      .eq('date', date)
      .eq('meal_type', mealType)

    await fetchPlans()
  }

  // 按 date+meal_type 索引，方便查找
  const planMap = {}
  for (const p of plans) {
    planMap[`${p.date}_${p.meal_type}`] = p
  }

  return { plans, planMap, loading, setPlan, clearPlan }
}
