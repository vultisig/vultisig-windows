import { KeygenMessage } from '../gen/vultisig/keygen/v1/keygen_message_pb';
import SevenZip from '7z-wasm';
export async function createKeygenMsg(
  isRelay: boolean,
  vaultName: string,
  serviceName: string,
  sessionID: string,
  hexEncryptedKey: string,
  hexChainCode: string
) {
  const keygenMessage = new KeygenMessage({
    sessionId: sessionID,
    hexChainCode: hexChainCode,
    serviceName: serviceName,
    encryptionKeyHex: hexEncryptedKey,
    useVultisigRelay: isRelay,
    vaultName: vaultName,
  });
  const serializedData = keygenMessage.toBinary();
  const bufferData = Buffer.from(serializedData);
  const sevenZip = await SevenZip({
    locateFile: (file: any) => `/7z-wasm/${file}`,
  });
  const archiveName = 'compressed.xz';
  sevenZip.FS.writeFile('data.bin', bufferData);
  sevenZip.callMain(['a', archiveName, 'data.bin']);
  const compressedData = sevenZip.FS.readFile(archiveName);
  const base64EncodedData = Buffer.from(compressedData).toString('base64');
  return base64EncodedData;
}
