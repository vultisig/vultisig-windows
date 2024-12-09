import { deepLinkBaseUrl } from '../deeplink/config';
import {
  KeysignMessage,
  KeysignPayload,
} from '../gen/vultisig/keysign/v1/keysign_message_pb';
import { addQueryParams } from '../lib/utils/query/addQueryParams';
import { KeygenServerType } from '../vault/keygen/server/KeygenServerType';
import { toCompressedString } from './protobuf/toCompressedString';

export async function createKeysignMessage(
  serverType: KeygenServerType,
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
    useVultisigRelay: serverType === 'relay',
    keysignPayload: keysignPayload,
  });
  const jsonData = await toCompressedString(keysignMessage);

  return addQueryParams(deepLinkBaseUrl, {
    type: 'SignTransaction',
    vault: vaultId,
    jsonData,
  });
}
