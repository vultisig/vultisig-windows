import { memoizeAsync } from '@lib/utils/memoizeAsync'
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader'

type Input = {
  canvasContext: CanvasRenderingContext2D
  image: CanvasImageSource
}

const initZxing = memoizeAsync(() => {
  const wasmUrl = '/core/wasm/zxing_reader.wasm'
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

  const first = results[0]
  if (!first || !first.text) {
    throw new Error('Failed to read QR code')
  }

  return first.text
}
