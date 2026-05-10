import { useNavigate } from 'react-router-dom'

export default function RecipeCard({ recipe, onDelete }) {
  const navigate = useNavigate()

  return (
    <div
      className="card-hover flex gap-4 cursor-pointer active:scale-[0.99]"
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      {recipe.image_url && (
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className="w-20 h-20 object-cover rounded-xl shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 truncate">{recipe.name}</h3>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(recipe.id) }}
            className="text-gray-300 hover:text-red-400 text-lg leading-none shrink-0 transition-colors"
            aria-label="删除"
          >
            ✕
          </button>
        </div>

        {recipe.description && (
          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{recipe.description}</p>
        )}

        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {recipe.tags.map((tag) => (
              <span key={tag} className="text-xs bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-lg font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {recipe.ingredients?.length > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">
            {recipe.ingredients.slice(0, 4).map((i) => i.name).join('、')}
            {recipe.ingredients.length > 4 && ` 等 ${recipe.ingredients.length} 种`}
          </p>
        )}
      </div>
    </div>
  )
}
