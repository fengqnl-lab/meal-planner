import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const TAGS = ['早餐', '午餐', '晚餐', '素菜', '荤菜', '汤', '主食', '甜点', '快手']

export default function RecipeForm({ onSubmit, onCancel, initialValues }) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [ingredients, setIngredients] = useState(initialValues?.ingredients?.length ? initialValues.ingredients : [{ name: '', amount: '', unit: '' }])
  const [steps, setSteps] = useState(initialValues?.steps?.length ? initialValues.steps : [{ content: '' }])
  const [tags, setTags] = useState(initialValues?.tags ?? [])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialValues?.image_url ?? null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(userId) {
    if (!imageFile) return null
    const ext = imageFile.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('recipe-images')
      .upload(path, imageFile, { upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('recipe-images').getPublicUrl(path)
    return data.publicUrl
  }

  function toggleTag(tag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  function updateIngredient(i, field, value) {
    setIngredients((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  function updateStep(i, value) {
    setSteps((prev) => prev.map((item, idx) => idx === i ? { content: value } : item))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return setError('请填写菜名')
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const imageUrl = imageFile
        ? await uploadImage(user.id)
        : imageRemoved ? null : (initialValues?.image_url ?? null)
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.content.trim()).map((s, i) => ({ order: i + 1, content: s.content })),
        tags,
        image_url: imageUrl,
      })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 封面图 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">封面图片</label>
        <label className="block cursor-pointer">
          {imagePreview ? (
            <img src={imagePreview} alt="预览" className="w-full h-44 object-cover rounded-xl" />
          ) : (
            <div className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 transition-colors">
              <span className="text-2xl mb-1">📷</span>
              <span className="text-sm">点击上传图片</span>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
        {imagePreview && (
          <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setImageRemoved(true) }}
            className="text-xs text-gray-400 hover:text-red-400 mt-1">
            移除图片
          </button>
        )}
      </div>

      {/* 菜名 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">菜名 *</label>
        <input className="input" placeholder="例：番茄炒蛋" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      {/* 简介 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">简介</label>
        <textarea className="input resize-none" rows={2} placeholder="简单描述一下这道菜…" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* 标签 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">分类标签</label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors
                ${tags.includes(tag)
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-primary-400'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 食材 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">食材</label>
        <div className="space-y-2">
          {ingredients.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input className="input flex-1" placeholder="食材名" value={item.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} />
              <input className="input w-20" placeholder="用量" value={item.amount} onChange={(e) => updateIngredient(i, 'amount', e.target.value)} />
              <input className="input w-16" placeholder="单位" value={item.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)} />
              {ingredients.length > 1 && (
                <button type="button" onClick={() => setIngredients((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-gray-400 hover:text-red-400 px-1">✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setIngredients((prev) => [...prev, { name: '', amount: '', unit: '' }])}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700">
          + 添加食材
        </button>
      </div>

      {/* 步骤 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">步骤</label>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-sm text-gray-400 mt-2 w-5 shrink-0">{i + 1}.</span>
              <textarea className="input flex-1 resize-none" rows={2} placeholder={`第 ${i + 1} 步`}
                value={step.content} onChange={(e) => updateStep(i, e.target.value)} />
              {steps.length > 1 && (
                <button type="button" onClick={() => setSteps((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-gray-400 hover:text-red-400 px-1 mt-2">✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setSteps((prev) => [...prev, { content: '' }])}
          className="mt-2 text-sm text-primary-600 hover:text-primary-700">
          + 添加步骤
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost flex-1">取消</button>
        <button type="submit" className="btn-primary flex-1" disabled={saving}>
          {saving ? '保存中…' : '保存菜谱'}
        </button>
      </div>
    </form>
  )
}
