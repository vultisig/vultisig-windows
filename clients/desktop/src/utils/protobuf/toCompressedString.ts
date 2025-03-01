import SevenZip from '7z-wasm'

export const toCompressedString = async (
  binary: Uint8Array<ArrayBufferLike>
) => {
  const sevenZip = await SevenZip()
  const archiveName = 'compressed.xz'
  sevenZip.FS.writeFile('data.bin', binary)
  sevenZip.callMain(['a', archiveName, 'data.bin'])
  const compressedData = sevenZip.FS.readFile(archiveName)

  return Buffer.from(compressedData).toString('base64')
}
