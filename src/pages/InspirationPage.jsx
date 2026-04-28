import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import IngredientInput from '../components/inspiration/IngredientInput'

function matchRecipes(recipes, inputs) {
  if (inputs.length === 0) return []

  return recipes
    .map((recipe) => {
      const recipeIngNames = (recipe.ingredients ?? []).map((i) => i.name)
      const matched = inputs.filter((input) =>
        recipeIngNames.some((name) => name.includes(input) || input.includes(name))
      )
      const missing = recipeIngNames.filter(
        (name) => !inputs.some((input) => name.includes(input) || input.includes(name))
      )
      return { ...recipe, matched, missing, score: matched.length }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.missing.length - b.missing.length)
}

export default function InspirationPage() {
  const { recipes, loading } = useRecipes()
  const [ingredients, setIngredients] = useState([])
  const [searched, setSearched] = useState(false)
  const navigate = useNavigate()

  const results = useMemo(
    () => searched ? matchRecipes(recipes, ingredients) : [],
    [searched, recipes, ingredients]
  )

  function handleSearch() {
    if (ingredients.length === 0) return
    setSearched(true)
  }

  function handleChange(newIngredients) {
    setIngredients(newIngredients)
    setSearched(false)
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">食材灵感</h2>
      <p className="text-sm text-gray-400 mb-4">输入冰箱里有的食材，发现能做的菜</p>

      <div className="space-y-3 mb-5">
        <IngredientInput ingredients={ingredients} onChange={handleChange} />
        <button
          className="btn-primary w-full"
          onClick={handleSearch}
          disabled={ingredients.length === 0 || loading}
        >
          查找可做的菜
        </button>
      </div>

      {/* 快捷标签 */}
      {!searched && (
        <div>
          <p className="text-xs text-gray-400 mb-2">常见食材</p>
          <div className="flex flex-wrap gap-2">
            {['鸡蛋', '番茄', '土豆', '豆腐', '猪肉', '鸡肉', '白菜', '胡萝卜', '洋葱', '大蒜', '姜', '米饭'].map((item) => (
              <button
                key={item}
                onClick={() => !ingredients.includes(item) && handleChange([...ingredients, item])}
                className={`px-3 py-1 rounded-full text-sm border transition-colors
                  ${ingredients.includes(item)
                    ? 'bg-primary-100 border-primary-200 text-primary-600'
                    : 'border-gray-200 text-gray-500 hover:border-primary-300'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 结果 */}
      {searched && (
        <div>
          {results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🤔</p>
              <p className="text-gray-500 text-sm mb-1">没有找到匹配的菜谱</p>
              <p className="text-gray-400 text-xs mb-4">试试换几个食材，或者先去菜谱库添加更多菜谱</p>
              <button onClick={() => navigate('/recipes')} className="btn-primary text-sm">
                去添加菜谱
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">找到 {results.length} 道可以做的菜</p>
              <div className="space-y-3">
                {results.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                    className="card w-full text-left flex gap-3 hover:shadow-md transition-shadow active:scale-[0.99]"
                  >
                    {recipe.image_url && (
                      <img src={recipe.image_url} alt={recipe.name}
                        className="w-16 h-16 object-cover rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{recipe.name}</p>

                      {/* 匹配食材 */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {recipe.matched.map((ing) => (
                          <span key={ing} className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">
                            ✓ {ing}
                          </span>
                        ))}
                      </div>

                      {/* 缺少食材 */}
                      {recipe.missing.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          还缺：{recipe.missing.slice(0, 3).join('、')}
                          {recipe.missing.length > 3 && ` 等 ${recipe.missing.length} 种`}
                        </p>
                      )}
                    </div>

                    {/* 匹配分 */}
                    <div className="shrink-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-primary-500">{recipe.matched.length}</span>
                      <span className="text-xs text-gray-400">匹配</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
