import { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { Crop, SlidersHorizontal } from 'lucide-react'
import getCroppedImg from '../../utils/cropImage'

const ASPECTS = [
  { label: '自由', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
]

const DEFAULT_ADJUSTMENTS = { brightness: 100, contrast: 100, saturation: 100 }

export default function ImageEditor({ imageSrc, onConfirm, onCancel }) {
  const [activeTab, setActiveTab] = useState('crop')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [aspect, setAspect] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [adjustments, setAdjustments] = useState(DEFAULT_ADJUSTMENTS)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, adjustments)
      onConfirm(blob)
    } catch {
      setProcessing(false)
    }
  }

  function handleAdjustment(key, value) {
    setAdjustments((prev) => ({ ...prev, [key]: Number(value) }))
  }

  const filterStyle = {
    filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`,
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <h2 className="text-white font-medium">编辑图片</h2>
        <button
          onClick={() => { setAdjustments(DEFAULT_ADJUSTMENTS); setZoom(1); setRotation(0) }}
          className="text-xs text-gray-400 hover:text-white"
        >
          重置
        </button>
      </div>

      {/* Main preview area */}
      <div className="flex-1 relative min-h-0">
        {activeTab === 'crop' ? (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { background: 'black' },
              mediaStyle: filterStyle,
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={imageSrc}
              alt="预览"
              className="max-w-full max-h-full object-contain rounded-lg"
              style={filterStyle}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="shrink-0 bg-gray-900 px-4 pt-3 pb-2">
        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1 mb-3">
          <button
            onClick={() => setActiveTab('crop')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === 'crop' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Crop size={16} />
            裁剪
          </button>
          <button
            onClick={() => setActiveTab('adjust')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === 'adjust' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <SlidersHorizontal size={16} />
            调整
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'crop' ? (
          <div className="space-y-3">
            {/* Aspect ratio */}
            <div className="flex gap-2 justify-center">
              {ASPECTS.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setAspect(value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${aspect === value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Rotation */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-10">旋转</span>
              <input
                type="range"
                min={-180}
                max={180}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1 accent-primary-500 h-1"
              />
              <span className="text-xs text-gray-400 w-8 text-right">{rotation}°</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { key: 'brightness', label: '亮度', min: 50, max: 150 },
              { key: 'contrast', label: '对比度', min: 50, max: 150 },
              { key: 'saturation', label: '饱和度', min: 0, max: 200 },
            ].map(({ key, label, min, max }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-10">{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={adjustments[key]}
                  onChange={(e) => handleAdjustment(key, e.target.value)}
                  className="flex-1 accent-primary-500 h-1"
                />
                <span className="text-xs text-gray-400 w-8 text-right">{adjustments[key]}</span>
              </div>
            ))}
            <button
              onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
              className="text-xs text-gray-500 hover:text-white"
            >
              重置调整
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 flex gap-3 px-4 py-3 pb-safe bg-gray-900 border-t border-gray-800">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-gray-400 hover:text-white font-medium transition-colors">
          取消
        </button>
        <button
          onClick={handleConfirm}
          disabled={processing}
          className="flex-1 py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {processing ? '处理中…' : '确认'}
        </button>
      </div>
    </div>
  )
}
