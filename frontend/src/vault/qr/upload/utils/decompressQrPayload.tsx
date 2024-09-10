import SevenZip from '7z-wasm';

export async function decompressQrPayload(value: string): Promise<Uint8Array> {
  const bufferData = Buffer.from(value, 'base64');
  const sevenZip = await SevenZip({
    locateFile: file => `/7z-wasm/${file}`,
  });
  sevenZip.FS.writeFile('data.xz', bufferData);
  sevenZip.callMain(['x', 'data.xz']);
  return sevenZip.FS.readFile('data');
}
