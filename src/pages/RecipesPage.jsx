import { useState, useMemo } from 'react'
import { useRecipes } from '../hooks/useRecipes'
import RecipeCard from '../components/recipes/RecipeCard'
import RecipeForm from '../components/recipes/RecipeForm'

export default function RecipesPage() {
  const { recipes, loading, error, addRecipe, deleteRecipe } = useRecipes()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('')

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
        <h2 className="text-xl font-bold mb-4">新增菜谱</h2>
        <RecipeForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">菜谱库</h2>
        <button className="btn-primary text-sm" onClick={() => setShowForm(true)}>+ 新增</button>
      </div>

      {/* 搜索 */}
      <input
        className="input mb-3"
        placeholder="搜菜名或食材…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          <button
            onClick={() => setActiveTag('')}
            className={`shrink-0 px-3 py-1 rounded-full text-sm border transition-colors
              ${!activeTag ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-200 text-gray-600'}`}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm border transition-colors
                ${activeTag === tag ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-200 text-gray-600'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* 列表 */}
      {loading && <p className="text-gray-400 text-sm text-center py-8">加载中…</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🍽️</p>
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
