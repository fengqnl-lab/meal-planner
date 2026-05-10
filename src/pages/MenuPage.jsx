import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMenu, getWeekRange, toDateStr } from '../hooks/useMenu'
import RecipePicker from '../components/menu/RecipePicker'

const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const MEALS = [
  { key: 'lunch',  label: '午餐' },
  { key: 'dinner', label: '晚餐' },
]

function formatMonth(date) {
  return `${date.getMonth() + 1}月`
}

function isToday(dateStr) {
  return dateStr === toDateStr(new Date())
}

export default function MenuPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const { planMap, loading, setPlan, clearPlan } = useMenu(weekOffset)
  const [picking, setPicking] = useState(null)
  const navigate = useNavigate()

  const [start, end] = getWeekRange(weekOffset)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })

  const monthLabel = start.getMonth() === end.getMonth()
    ? `${start.getFullYear()}年${formatMonth(start)}`
    : `${formatMonth(start)} / ${formatMonth(end)}`

  async function handleSelect(recipe) {
    await setPlan(picking.date, picking.mealType, recipe.id)
    setPicking(null)
  }

  return (
    <div>
      {/* 周导航 */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center text-gray-500 hover:shadow-card-hover transition-all">‹</button>
        <div className="text-center">
          <p className="font-semibold text-gray-800 tracking-tight">{monthLabel}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {toDateStr(start).slice(5).replace('-', '/')} – {toDateStr(end).slice(5).replace('-', '/')}
          </p>
        </div>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center text-gray-500 hover:shadow-card-hover transition-all">›</button>
      </div>

      {weekOffset !== 0 && (
        <button onClick={() => setWeekOffset(0)} className="w-full text-xs text-primary-600 mb-4 hover:text-primary-700 font-medium">
          回到本周
        </button>
      )}

      {loading ? (
        <p className="text-center text-gray-400 py-12 text-sm">加载中…</p>
      ) : (
        <div className="space-y-3">
          {days.map((day, i) => {
            const dateStr = toDateStr(day)
            const today = isToday(dateStr)
            return (
              <div key={dateStr} className={`card ${today ? 'shadow-glow' : ''}`}>
                {/* 日期头 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm font-semibold ${today ? 'text-primary-700' : 'text-gray-700'}`}>
                    {DAYS[i]}
                  </span>
                  <span className="text-xs text-gray-400">{dateStr.slice(5).replace('-', '/')}</span>
                  {today && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-lg font-medium">今天</span>}
                </div>

                {/* 午餐 / 晚餐 */}
                <div className="grid grid-cols-2 gap-2.5">
                  {MEALS.map(({ key, label }) => {
                    const plan = planMap[`${dateStr}_${key}`]
                    return (
                      <div key={key}>
                        <p className="text-xs text-gray-400 mb-1.5 font-medium">{label}</p>
                        {plan ? (
                          <div
                            className="relative group rounded-xl overflow-hidden bg-stone-50 border border-stone-100 cursor-pointer hover:shadow-sm transition-all"
                            onClick={() => plan.recipe?.id && navigate(`/recipes/${plan.recipe.id}`)}
                          >
                            {plan.recipe?.image_url && (
                              <img src={plan.recipe.image_url} alt="" className="w-full h-16 object-cover" />
                            )}
                            <p className={`text-sm font-medium text-gray-700 px-2.5 py-2 truncate
                              ${plan.recipe?.image_url ? 'bg-white/90' : ''}`}>
                              {plan.recipe?.name ?? '已规划'}
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); clearPlan(dateStr, key) }}
                              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/30 text-white text-xs
                                         flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPicking({ date: dateStr, mealType: key })}
                            className="w-full h-14 rounded-xl border-2 border-dashed border-stone-200
                                       text-stone-300 text-xl hover:border-primary-400 hover:text-primary-500
                                       transition-all duration-200 flex items-center justify-center"
                          >
                            +
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {picking && (
        <RecipePicker
          onSelect={handleSelect}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  )
}
