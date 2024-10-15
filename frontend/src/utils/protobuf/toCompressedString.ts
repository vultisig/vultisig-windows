import { Message } from '@bufbuild/protobuf';
import SevenZip from '7z-wasm';

export const toCompressedString = async (value: Message) => {
  const serializedData = value.toBinary();
  const bufferData = Buffer.from(serializedData);
  const sevenZip = await SevenZip({
    locateFile: (file: any) => `/7z-wasm/${file}`,
  });
  const archiveName = 'compressed.xz';
  sevenZip.FS.writeFile('data.bin', bufferData);
  sevenZip.callMain(['a', archiveName, 'data.bin']);
  const compressedData = sevenZip.FS.readFile(archiveName);

  return Buffer.from(compressedData).toString('base64');
};
