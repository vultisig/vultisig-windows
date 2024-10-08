import SevenZip from '7z-wasm';

import { KeygenMessage } from '../gen/vultisig/keygen/v1/keygen_message_pb';
import {
  KeysignMessage,
  KeysignPayload,
} from '../gen/vultisig/keysign/v1/keysign_message_pb';

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
  const payload = Buffer.from(compressedData).toString('base64');

  return `vultisig://vultisig.com?type=NewVault&tssType=Keygen&jsonData=${payload}`;
}
export async function createKeysignMessage(
  isRelay: boolean,
  serviceName: string,
  sessionID: string,
  hexEncryptedKey: string,
  keysignPayload: KeysignPayload
) {
  const keysignMessage = new KeysignMessage({
    sessionId: sessionID,
    serviceName: serviceName,
    encryptionKeyHex: hexEncryptedKey,
    useVultisigRelay: isRelay,
    keysignPayload: keysignPayload,
  });
  console.log('keysignMessage', keysignMessage);
  const serializedData = keysignMessage.toBinary();
  const bufferData = Buffer.from(serializedData);
  const sevenZip = await SevenZip({
    locateFile: (file: any) => `/7z-wasm/${file}`,
  });
  const archiveName = 'compressed.xz';
  sevenZip.FS.writeFile('data.bin', bufferData);
  sevenZip.callMain(['a', archiveName, 'data.bin']);
  const compressedData = sevenZip.FS.readFile(archiveName);
  return Buffer.from(compressedData).toString('base64');
}
