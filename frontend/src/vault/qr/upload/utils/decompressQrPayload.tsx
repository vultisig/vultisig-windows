import lzma from 'lzma-native';

export async function decompressQrPayload(
  compressedString: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const compressedBuffer = Buffer.from(compressedString, 'base64'); // Adjust encoding if necessary

    lzma.LZMA().decompress(compressedBuffer, result => {
      if (!result) {
        reject(new Error('Failed to decompress QR payload'));
        return;
      }
      const decompressedString = Buffer.from(result).toString('utf-8');
      resolve(decompressedString);
    });
  });
}
