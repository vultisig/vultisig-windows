import { readQrCode } from '@core/ui/qr/utils/readQrCode'
import { useMutation } from '@tanstack/react-query'
import { attempt } from '@vultisig/lib-utils/attempt'

const retryScale = 2

// The retry only rescues QRs with under ~2px per module, which fit in small
// images; upscaling a large photo would allocate hundreds of MB for nothing.
const maxRetryPixelCount = 4096 * 4096

type ReadQrCodeAtScaleInput = {
  image: ImageBitmap
  scale: number
}

const readQrCodeAtScale = ({ image, scale }: ReadQrCodeAtScaleInput) => {
  const canvas = document.createElement('canvas')
  canvas.width = image.width * scale
  canvas.height = image.height * scale

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Could not get canvas context')
  }
  context.imageSmoothingEnabled = false

  return readQrCode({
    canvasContext: context,
    image,
  })
}

/**
 * Decodes the QR in an uploaded image file. An image that fails at its native
 * size is retried on a 2x nearest-neighbour upscale: a dense QR saved from a
 * 1x screen has under 2px per module, too few for the reader. Images whose
 * upscale would exceed 4096×4096 pixels are not retried.
 */
export const useProcessQrMutation = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const image = await createImageBitmap(file)

      const retryPixelCount = image.width * image.height * retryScale ** 2
      if (retryPixelCount > maxRetryPixelCount) {
        return readQrCodeAtScale({ image, scale: 1 })
      }

      const result = await attempt(() => readQrCodeAtScale({ image, scale: 1 }))
      if ('error' in result) {
        return readQrCodeAtScale({ image, scale: retryScale })
      }

      return result.data
    },
  })
}
