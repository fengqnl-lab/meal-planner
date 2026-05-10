import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import RecipeCard from '../components/recipes/RecipeCard'
import RecipeForm from '../components/recipes/RecipeForm'

export default function RecipesPage() {
  const { recipes, loading, error, addRecipe, deleteRecipe } = useRecipes()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const location = useLocation()

  useEffect(() => {
    if (location.state?.cancelForm) {
      setShowForm(false)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const allTags = useMemo(() => {
    const set = new Set(recipes.flatMap((r) => r.tags ?? []))
    return [...set]
  }, [recipes])

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchSearch = !search || r.name.includes(search) ||
        r.ingredients?.some((i) => i.name.includes(search))
      const matchTag = !activeTag || r.tags?.includes(activeTag)
      return matchSearch && matchTag
    })
  }, [recipes, search, activeTag])

  async function handleAdd(recipe) {
    await addRecipe(recipe)
    setShowForm(false)
  }

  if (showForm) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-5 text-gray-800 tracking-tight">新增菜谱</h2>
        <RecipeForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">菜谱库</h2>
        <button className="btn-primary text-sm" onClick={() => setShowForm(true)}>+ 新增</button>
      </div>

      {/* 搜索 */}
      <input
        className="input mb-4"
        placeholder="搜菜名或食材…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setActiveTag('')}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-sm transition-all duration-200
              ${!activeTag ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 shadow-card hover:shadow-card-hover'}`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-sm transition-all duration-200
                ${activeTag === tag ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-600 shadow-card hover:shadow-card-hover'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 列表 */}
      {loading && <p className="text-gray-400 text-sm text-center py-12">加载中…</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-sm">{search || activeTag ? '没有匹配的菜谱' : '还没有菜谱，点右上角新增吧'}</p>
        </div>
      )}
      <div className="space-y-3">
        {filtered.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onDelete={deleteRecipe} />
        ))}
      </div>
    </div>
  )
}
