import { readQrCode } from '@core/ui/qr/utils/readQrCode'
import { useMutation } from '@tanstack/react-query'

export const useProcessQrMutation = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const imageBitmap = await createImageBitmap(file)

      const canvas = document.createElement('canvas')
      canvas.width = imageBitmap.width
      canvas.height = imageBitmap.height

      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Could not get canvas context')
      }

      return readQrCode({
        canvasContext: context,
        image: imageBitmap,
      })
    },
  })
}
