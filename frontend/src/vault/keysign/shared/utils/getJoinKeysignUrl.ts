import { KeysignMessagePayload } from '../../../../chain/keysign/KeysignMessagePayload';
import { deepLinkBaseUrl } from '../../../../deeplink/config';
import { KeysignMessage } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { matchRecordUnion } from '../../../../lib/utils/matchRecordUnion';
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
  payload?: KeysignMessagePayload;
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
    payloadId,
  });

  if (payload) {
    matchRecordUnion(payload, {
      keysign: keysignPayload => {
        keysignMessage.keysignPayload = keysignPayload;
      },
      custom: customPayload => {
        keysignMessage.customMessagePayload = customPayload;
      },
    });
  }

  const jsonData = await toCompressedString(keysignMessage);

  const urlWithPayload = addQueryParams(deepLinkBaseUrl, {
    type: 'SignTransaction',
    vault: vaultId,
    jsonData,
  });

  if (payload && 'keysign' in payload && urlWithPayload.length > urlMaxLength) {
    const compressedPayload = await toCompressedString(payload.keysign);
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
