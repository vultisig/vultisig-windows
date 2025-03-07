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
  sevenZip.FS.writeFile('data.bin', binary)
  sevenZip.callMain(['a', archiveName, 'data.bin'])
  const compressedData = sevenZip.FS.readFile(archiveName)

  return Buffer.from(compressedData).toString('base64')
}
