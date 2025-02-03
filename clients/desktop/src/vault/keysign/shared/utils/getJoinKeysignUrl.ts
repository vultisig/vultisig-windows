import { create, toBinary } from '@bufbuild/protobuf';
import {
  KeysignMessageSchema,
  KeysignPayloadSchema,
} from '@core/communication/vultisig/keysign/v1/keysign_message_pb';
import { matchRecordUnion } from '@lib/utils/matchRecordUnion';
import { addQueryParams } from '@lib/utils/query/addQueryParams';

import { KeysignMessagePayload } from '../../../../chain/keysign/KeysignMessagePayload';
import { deepLinkBaseUrl } from '../../../../deeplink/config';
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
  const keysignMessage = create(KeysignMessageSchema, {
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

  const binary = toBinary(KeysignMessageSchema, keysignMessage);

  const jsonData = await toCompressedString(binary);

  const urlWithPayload = addQueryParams(deepLinkBaseUrl, {
    type: 'SignTransaction',
    vault: vaultId,
    jsonData,
  });

  if (payload && 'keysign' in payload && urlWithPayload.length > urlMaxLength) {
    const binary = toBinary(KeysignPayloadSchema, payload.keysign);
    const compressedPayload = await toCompressedString(binary);
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
