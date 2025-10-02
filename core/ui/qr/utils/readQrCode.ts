import { memoizeAsync } from '@lib/utils/memoizeAsync'
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader'

type Input = {
  canvasContext: CanvasRenderingContext2D
  image: CanvasImageSource
}

const wasmUrl = '/core/wasm/zxing_reader.wasm'

const initZxing = memoizeAsync(() => {
  return prepareZXingModule({
    overrides: {
      locateFile: (path, prefix) =>
        path.endsWith('.wasm') ? wasmUrl : prefix + path,
    },
    fireImmediately: true,
  })
})

export const readQrCode = async ({
  canvasContext,
  image,
}: Input): Promise<string> => {
  const { width, height } = canvasContext.canvas

  canvasContext.drawImage(image, 0, 0, width, height)

  const imageData = canvasContext.getImageData(0, 0, width, height)

  await initZxing()

  const results = await readBarcodes(imageData, {
    formats: ['QRCode'],
    tryHarder: true,
  })

  if (results.length === 0) {
    throw new Error('Failed to read QR code')
  }

  return results[0].text
}
