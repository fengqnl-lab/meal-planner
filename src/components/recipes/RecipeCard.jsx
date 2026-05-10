import { useNavigate } from 'react-router-dom'

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate()

  return (
    <div
      className="group cursor-pointer active:scale-[0.98] transition-all duration-200"
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      {/* 图片 */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-2">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-stone-300">
            🍽️
          </div>
        )}
      </div>

      {/* 标题 */}
      <h3 className="font-medium text-gray-800 text-sm leading-snug line-clamp-2 px-0.5">
        {recipe.name}
      </h3>

      {/* 标签 */}
      {recipe.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5 px-0.5">
          {recipe.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs text-gray-400">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
