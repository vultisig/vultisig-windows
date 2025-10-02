import { ZXING_WASM_VERSION } from 'zxing-wasm'
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader'

type Input = {
  canvasContext: CanvasRenderingContext2D
  image: CanvasImageSource
}

let zxingReadyPromise: Promise<void> | null = null

const ensureZxingReady = () => {
  if (!zxingReadyPromise) {
    const wasmUrl = `https://cdn.jsdelivr.net/npm/zxing-wasm@${ZXING_WASM_VERSION}/dist/reader/zxing_reader.wasm`
    zxingReadyPromise = prepareZXingModule({
      overrides: {
        locateFile: (path, prefix) =>
          path.endsWith('.wasm') ? wasmUrl : prefix + path,
      },
      fireImmediately: true,
    }).then(() => void 0)
  }
  return zxingReadyPromise
}

export const readQrCode = async ({
  canvasContext,
  image,
}: Input): Promise<string> => {
  const { width, height } = canvasContext.canvas

  canvasContext.drawImage(image, 0, 0, width, height)

  const imageData = canvasContext.getImageData(0, 0, width, height)

  await ensureZxingReady()

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
