import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, MoreHorizontal } from 'lucide-react'
import { useRecipe, useRecipes } from '../hooks/useRecipes'
import RecipeForm from '../components/recipes/RecipeForm'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recipe, loading, error } = useRecipe(id)
  const { deleteRecipe, updateRecipe } = useRecipes()
  const [editing, setEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  async function handleDelete() {
    setMenuOpen(false)
    if (!confirm(`确认删除「${recipe.name}」？`)) return
    await deleteRecipe(id)
    navigate('/recipes', { replace: true })
  }

  async function handleUpdate(data) {
    await updateRecipe(id, data)
    setEditing(false)
    window.location.reload()
  }

  if (loading) return <p className="text-center py-12 text-gray-400">加载中…</p>
  if (error || !recipe) return <p className="text-center py-12 text-red-400">菜谱不存在</p>

  if (editing) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-5 text-gray-800 tracking-tight">编辑菜谱</h2>
        <RecipeForm
          initialValues={recipe}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="-mx-4 -mt-6">
      {/* 封面图 + 悬浮按钮 */}
      <div className="relative">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name} className="w-full h-72 object-cover" />
        ) : (
          <div className="w-full h-44 bg-stone-100 flex items-center justify-center text-5xl text-stone-300">🍽️</div>
        )}

        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        {/* 更多按钮 */}
        <div className="absolute top-4 right-4" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition-all"
          >
            <MoreHorizontal size={20} />
          </button>

          {menuOpen && (
            <div className="absolute top-12 right-0 bg-white rounded-xl shadow-elevated py-1.5 min-w-[120px] z-10">
              <button
                onClick={() => { setMenuOpen(false); setEditing(true) }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-stone-50 transition-colors"
              >
                编辑菜谱
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                删除菜谱
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-5 pt-5 pb-8">
        {/* 标题 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1.5 tracking-tight">{recipe.name}</h1>
        {recipe.description && (
          <p className="text-gray-500 text-sm mb-4 leading-relaxed">{recipe.description}</p>
        )}

        {/* 标签 */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.tags.map((tag) => (
              <span key={tag} className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-xl font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 食材 */}
        {recipe.ingredients?.length > 0 && (
          <section className="card mb-4">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">食材</h2>
            <div className="card-inset">
              <ul className="divide-y divide-stone-100">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex justify-between py-2.5 text-sm">
                    <span className="text-gray-700">{ing.name}</span>
                    <span className="text-gray-400 font-light">{ing.amount}{ing.unit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 步骤 */}
        {recipe.steps?.length > 0 && (
          <section className="card">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">步骤</h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3.5 text-sm">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-semibold">
                    {step.order ?? i + 1}
                  </span>
                  <p className="text-gray-600 leading-relaxed pt-0.5">{step.content}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  )
}
