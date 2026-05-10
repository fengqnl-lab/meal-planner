import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
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
      {/* 搜索栏 */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-10"
          placeholder="搜索菜谱…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 分类 tabs */}
      <div className="flex gap-1 mb-5 border-b border-stone-100 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTag('')}
          className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px
            ${!activeTag ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          全部
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px
              ${activeTag === tag ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {loading && <p className="text-gray-400 text-sm text-center py-12">加载中…</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-sm">{search || activeTag ? '没有匹配的菜谱' : '还没有菜谱，点击 + 新增吧'}</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onDelete={deleteRecipe} />
        ))}
      </div>
    </div>
  )
}
