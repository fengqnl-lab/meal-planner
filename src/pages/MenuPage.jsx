import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMenu, toDateStr } from '../hooks/useMenu'
import RecipePicker from '../components/menu/RecipePicker'

const DAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function getNext7Days() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

function isWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

function formatTabLabel(date, index) {
  if (index === 0) return '今天'
  if (index === 1) return '明天'
  return DAY_NAMES[date.getDay()]
}

export default function MenuPage() {
  const days = getNext7Days()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const selectedDate = days[selectedIdx]
  const dateStr = toDateStr(selectedDate)
  const weekend = isWeekend(selectedDate)

  const { planMap, loading, setPlan, clearPlan } = useMenu(0)
  const [picking, setPicking] = useState(null)
  const navigate = useNavigate()

  const meals = weekend
    ? [
        { label: '午餐', slots: ['lunch_1', 'lunch_2'] },
        { label: '晚餐', slots: ['dinner_1', 'dinner_2'] },
      ]
    : [
        { label: '晚餐', slots: ['dinner_1', 'dinner_2'] },
      ]

  async function handleSelect(recipe) {
    await setPlan(picking.date, picking.mealType, recipe.id)
    setPicking(null)
  }

  function getPlan(slot) {
    return planMap[`${dateStr}_${slot}`] || planMap[`${dateStr}_${slot.replace('_1', '').replace('_2', '')}`]
  }

  return (
    <div>
      {/* 日期 tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {days.map((day, i) => {
          const active = i === selectedIdx
          return (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl transition-all duration-200
                ${active
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 shadow-card hover:shadow-card-hover'}`}
            >
              <span className="text-xs font-medium">{formatTabLabel(day, i)}</span>
              <span className={`text-lg font-bold mt-0.5 ${active ? 'text-white' : 'text-gray-800'}`}>
                {day.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12 text-sm">加载中…</p>
      ) : (
        <div className="space-y-6">
          {meals.map(({ label, slots }) => (
            <section key={label}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{label}</h3>
              <div className="grid grid-cols-2 gap-3">
                {slots.map((slot) => {
                  const plan = getPlan(slot)
                  return (
                    <div key={slot}>
                      {plan ? (
                        <div
                          className="card-hover cursor-pointer group relative"
                          onClick={() => plan.recipe?.id && navigate(`/recipes/${plan.recipe.id}`)}
                        >
                          {plan.recipe?.image_url ? (
                            <img src={plan.recipe.image_url} alt="" className="w-full aspect-square object-cover rounded-xl mb-2" />
                          ) : (
                            <div className="w-full aspect-square bg-stone-100 rounded-xl mb-2 flex items-center justify-center text-3xl text-stone-300">🍽️</div>
                          )}
                          <p className="text-sm font-medium text-gray-800 text-center line-clamp-2">
                            {plan.recipe?.name ?? '已规划'}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); clearPlan(dateStr, slot) }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs
                                       flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPicking({ date: dateStr, mealType: slot })}
                          className="w-full aspect-square rounded-xl border-2 border-dashed border-stone-200
                                     text-stone-300 text-3xl hover:border-primary-400 hover:text-primary-500
                                     transition-all duration-200 flex items-center justify-center bg-white/50"
                        >
                          +
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
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
