import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecipes } from '../../hooks/useRecipes'

export default function RecipePicker({ onSelect, onClose }) {
  const { recipes, loading } = useRecipes()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = recipes.filter((r) =>
    !search || r.name.includes(search) || r.tags?.some((t) => t.includes(search))
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[75vh] flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">选择菜谱</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => { onClose(); navigate('/recipes') }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + 新增菜谱
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
          </div>
          <input
            className="input"
            placeholder="搜菜名或标签…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {loading && <p className="text-center text-gray-400 py-6 text-sm">加载中…</p>}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-4">
                {search ? '没有匹配的菜谱' : '还没有菜谱'}
              </p>
              <button
                onClick={() => { onClose(); navigate('/recipes') }}
                className="btn-primary text-sm"
              >
                + 去新增菜谱
              </button>
            </div>
          )}
          {filtered.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => onSelect(recipe)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 text-left transition-colors"
            >
              {recipe.image_url ? (
                <img src={recipe.image_url} alt={recipe.name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-primary-50 rounded-lg shrink-0 flex items-center justify-center text-xl">🍽️</div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">{recipe.name}</p>
                {recipe.tags?.length > 0 && (
                  <p className="text-xs text-gray-400 truncate">{recipe.tags.join('・')}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
