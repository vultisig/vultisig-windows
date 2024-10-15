import SevenZip from '7z-wasm';

import {
  KeysignMessage,
  KeysignPayload,
} from '../gen/vultisig/keysign/v1/keysign_message_pb';

export async function createKeysignMessage(
  isRelay: boolean,
  serviceName: string,
  sessionID: string,
  hexEncryptedKey: string,
  keysignPayload: KeysignPayload,
  vaultId: string
) {
  const keysignMessage = new KeysignMessage({
    sessionId: sessionID,
    serviceName: serviceName,
    encryptionKeyHex: hexEncryptedKey,
    useVultisigRelay: isRelay,
    keysignPayload: keysignPayload,
  });
  const serializedData = keysignMessage.toBinary();
  const bufferData = Buffer.from(serializedData);
  const sevenZip = await SevenZip({
    locateFile: (file: any) => `/7z-wasm/${file}`,
  });
  const archiveName = 'compressed.xz';
  sevenZip.FS.writeFile('data.bin', bufferData);
  sevenZip.callMain(['a', archiveName, 'data.bin']);
  const compressedData = sevenZip.FS.readFile(archiveName);

  const payload = Buffer.from(compressedData).toString('base64');

  return `vultisig://vultisig.com?type=SignTransaction&vault=${vaultId}&jsonData=${payload}`;
}
