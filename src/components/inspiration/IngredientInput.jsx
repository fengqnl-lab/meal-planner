import { useState } from 'react'

export default function IngredientInput({ ingredients, onChange }) {
  const [input, setInput] = useState('')

  function add() {
    const val = input.trim()
    if (!val || ingredients.includes(val)) { setInput(''); return }
    onChange([...ingredients, val])
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && ingredients.length > 0) {
      onChange(ingredients.slice(0, -1))
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
      {ingredients.map((ing) => (
        <span key={ing} className="flex items-center gap-1 bg-primary-100 text-primary-700 text-sm px-2.5 py-1 rounded-full">
          {ing}
          <button type="button" onClick={() => onChange(ingredients.filter((i) => i !== ing))}
            className="text-primary-400 hover:text-primary-700 leading-none">✕</button>
        </span>
      ))}
      <input
        className="flex-1 min-w-24 outline-none text-sm placeholder-gray-400 bg-transparent"
        placeholder={ingredients.length === 0 ? '输入食材，按回车添加…' : '继续添加…'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={add}
      />
    </div>
  )
}
