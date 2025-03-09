import SevenZip from '7z-wasm'

export const toCompressedString = async (
  binary: Uint8Array<ArrayBufferLike>
) => {
  let sevenZip
  try {
    sevenZip = await SevenZip({
      locateFile: (file: any) => `/7z-wasm/${file}`,
    })
  } catch {
    sevenZip = await SevenZip()
  }
  const archiveName = 'compressed.xz'
  sevenZip.FS.writeFile('data.bin', binary)
  sevenZip.callMain(['a', archiveName, 'data.bin'])
  const compressedData = sevenZip.FS.readFile(archiveName)

  return Buffer.from(compressedData).toString('base64')
}
