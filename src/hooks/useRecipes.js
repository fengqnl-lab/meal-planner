import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

async function getOrCreateFamilyId(userId) {
  const { data: member } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (member) return member.family_id

  // 触发器之前注册的用户，通过 security definer 函数绕开 RLS 鸡蛋问题
  const { data, error } = await supabase.rpc('create_family_for_user', { user_id: userId })
  if (error) throw error
  return data
}

export function useRecipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setRecipes(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  async function addRecipe(recipe) {
    const { data: { user } } = await supabase.auth.getUser()
    const familyId = await getOrCreateFamilyId(user.id)

    const { error } = await supabase.from('recipes').insert({
      ...recipe,
      family_id: familyId,
      created_by: user.id,
    })
    if (error) throw error
    await fetchRecipes()
  }

  async function deleteRecipe(id) {
    const { error } = await supabase.from('recipes').delete().eq('id', id)
    if (error) throw error
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  async function updateRecipe(id, data) {
    const { error } = await supabase.from('recipes').update(data).eq('id', id)
    if (error) throw error
    await fetchRecipes()
  }

  return { recipes, loading, error, addRecipe, deleteRecipe, updateRecipe, refetch: fetchRecipes }
}

export function useRecipe(id) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    supabase.from('recipes').select('*').eq('id', id).single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setRecipe(data)
        setLoading(false)
      })
  }, [id])

  return { recipe, loading, error }
}
