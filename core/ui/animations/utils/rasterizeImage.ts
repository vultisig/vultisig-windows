const defaultSize = 128

/**
 * Loads an image from a URL and rasterizes it to PNG bytes via an
 * off-screen canvas. Works with any format the browser can decode
 * (SVG, PNG, JPEG, WebP, etc.).
 */
export const rasterizeImage = (
  url: string,
  size = defaultSize
): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'))
      ctx.drawImage(img, 0, 0, size, size)
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Failed to rasterize image'))
        blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf)))
      }, 'image/png')
    }
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
    img.src = url
  })
