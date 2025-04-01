import { getSevenZip } from '@core/mpc/compression/getSevenZip'

export async function decompressQrPayload(value: string): Promise<Uint8Array> {
  const bufferData = Buffer.from(value, 'base64')
  const sevenZip = await getSevenZip()
  sevenZip.FS.writeFile('data.xz', bufferData)
  sevenZip.callMain(['x', 'data.xz', '-y'])
  return sevenZip.FS.readFile('data')
}
