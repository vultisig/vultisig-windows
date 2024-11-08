import { deepLinkBaseUrl } from '../../../../constants';
import {
  KeysignMessage,
  KeysignPayload,
} from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { addQueryParams } from '../../../../lib/utils/query/addQueryParams';
import { toCompressedString } from '../../../../utils/protobuf/toCompressedString';
import {
  KeygenServerType,
  keygenServerUrl,
} from '../../../keygen/server/KeygenServerType';
import { uploadPayloadToServer } from '../../../server/utils/uploadPayloadToServer';

export type GetJoinKeysignUrlInput = {
  serverType: KeygenServerType;
  serviceName: string;
  sessionId: string;
  hexEncryptionKey: string;
  payload?: KeysignPayload;
  payloadId?: string;
  vaultId: string;
};

const urlMaxLength = 2048;

export const getJoinKeysignUrl = async ({
  serverType,
  serviceName,
  sessionId,
  hexEncryptionKey,
  payload,
  payloadId,
  vaultId,
}: GetJoinKeysignUrlInput): Promise<string> => {
  const keysignMessage = new KeysignMessage({
    sessionId,
    serviceName: serviceName,
    encryptionKeyHex: hexEncryptionKey,
    useVultisigRelay: serverType === 'relay',
    keysignPayload: payload,
    payloadId,
  });

  const jsonData = await toCompressedString(keysignMessage);

  const urlWithPayload = addQueryParams(deepLinkBaseUrl, {
    type: 'SignTransaction',
    vault: vaultId,
    jsonData,
  });

  if (payload && urlWithPayload.length > urlMaxLength) {
    const compressedPayload = await toCompressedString(payload);
    const payloadId = await uploadPayloadToServer({
      payload: compressedPayload,
      serverUrl: keygenServerUrl[serverType],
    });

    return getJoinKeysignUrl({
      serverType,
      serviceName,
      sessionId,
      hexEncryptionKey,
      payloadId,
      vaultId,
    });
  }

  return urlWithPayload;
};
