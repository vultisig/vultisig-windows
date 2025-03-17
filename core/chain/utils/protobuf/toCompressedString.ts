import { attempt } from '@lib/utils/attempt'
import { SevenZipModule } from '7z-wasm'

type ToCompressedStringInput = {
  sevenZip: SevenZipModule
  binary: Uint8Array<ArrayBufferLike>
}

export const toCompressedString = ({
  sevenZip,
  binary,
}: ToCompressedStringInput) => {
  const archiveName = 'compressed.xz'
  const inputFileName = 'data.bin'

  try {
    sevenZip.FS.writeFile(inputFileName, binary)
    sevenZip.callMain(['a', archiveName, inputFileName])
    const compressedData = sevenZip.FS.readFile(archiveName)
    return Buffer.from(compressedData).toString('base64')
  } finally {
    attempt(() => {
      sevenZip.FS.unlink(inputFileName)
      sevenZip.FS.unlink(archiveName)
    })
  }
}
