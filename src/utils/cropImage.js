const MAX_DIMENSION = 1200

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (e) => reject(e))
    image.crossOrigin = 'anonymous'
    image.src = url
  })
}

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180
}

function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation)
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0, adjustments = {}) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const rotRad = getRadianAngle(rotation)
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.translate(-image.width / 2, -image.height / 2)
  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')

  let outWidth = pixelCrop.width
  let outHeight = pixelCrop.height
  if (outWidth > MAX_DIMENSION || outHeight > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(outWidth, outHeight)
    outWidth = Math.round(outWidth * scale)
    outHeight = Math.round(outHeight * scale)
  }

  croppedCanvas.width = outWidth
  croppedCanvas.height = outHeight

  const { brightness = 100, contrast = 100, saturation = 100 } = adjustments
  croppedCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, outWidth, outHeight
  )

  return new Promise((resolve) => {
    croppedCanvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85)
  })
}
