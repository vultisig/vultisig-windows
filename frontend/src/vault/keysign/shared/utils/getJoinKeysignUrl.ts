import { deepLinkBaseUrl } from '../../../../constants';
import {
  KeysignMessage,
  KeysignPayload,
} from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { addQueryParams } from '../../../../lib/utils/query/addQueryParams';
import { toCompressedString } from '../../../../utils/protobuf/toCompressedString';
import { KeygenServerType } from '../../../keygen/KeygenServerType';

export type GetJoinKeysignUrlInput = {
  serverType: KeygenServerType;
  serviceName: string;
  sessionId: string;
  hexEncryptionKey: string;
  payload: KeysignPayload;
  vaultId: string;
};

export const getJoinKeysignUrl = async ({
  serverType,
  serviceName,
  sessionId,
  hexEncryptionKey,
  payload,
  vaultId,
}: GetJoinKeysignUrlInput) => {
  const keysignMessage = new KeysignMessage({
    sessionId,
    serviceName: serviceName,
    encryptionKeyHex: hexEncryptionKey,
    useVultisigRelay: serverType === 'relay',
    keysignPayload: payload,
  });

  const jsonData = await toCompressedString(keysignMessage);

  return addQueryParams(deepLinkBaseUrl, {
    type: 'SignTransaction',
    vault: vaultId,
    jsonData,
  });
};
