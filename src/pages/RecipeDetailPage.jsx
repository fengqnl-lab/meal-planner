import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRecipe, useRecipes } from '../hooks/useRecipes'
import RecipeForm from '../components/recipes/RecipeForm'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recipe, loading, error } = useRecipe(id)
  const { deleteRecipe, updateRecipe } = useRecipes()
  const [editing, setEditing] = useState(false)

  async function handleDelete() {
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">编辑菜谱</h2>
        </div>
        <RecipeForm
          initialValues={recipe}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="pb-4">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm flex items-center gap-1">
          ← 返回
        </button>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-sm text-primary-600 hover:text-primary-700 px-3 py-1.5">
            编辑
          </button>
          <button onClick={handleDelete} className="text-sm text-red-400 hover:text-red-600 px-3 py-1.5">
            删除
          </button>
        </div>
      </div>

      {/* 封面图 */}
      {recipe.image_url && (
        <img src={recipe.image_url} alt={recipe.name} className="w-full h-52 object-cover rounded-xl mb-4" />
      )}

      {/* 标题 */}
      <h1 className="text-2xl font-bold text-gray-800 mb-1">{recipe.name}</h1>
      {recipe.description && (
        <p className="text-gray-500 text-sm mb-3">{recipe.description}</p>
      )}

      {/* 标签 */}
      {recipe.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {recipe.tags.map((tag) => (
            <span key={tag} className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 食材 */}
      {recipe.ingredients?.length > 0 && (
        <section className="card mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">食材</h2>
          <ul className="divide-y divide-gray-50">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex justify-between py-2 text-sm">
                <span className="text-gray-800">{ing.name}</span>
                <span className="text-gray-400">{ing.amount}{ing.unit}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 步骤 */}
      {recipe.steps?.length > 0 && (
        <section className="card">
          <h2 className="font-semibold text-gray-700 mb-3">步骤</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-medium">
                  {step.order ?? i + 1}
                </span>
                <p className="text-gray-700 leading-relaxed pt-0.5">{step.content}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
