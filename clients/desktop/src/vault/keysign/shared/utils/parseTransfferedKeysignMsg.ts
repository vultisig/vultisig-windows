import { fromBinary } from '@bufbuild/protobuf';
import {
  KeysignMessage,
  KeysignMessageSchema,
  KeysignPayloadSchema,
} from '@core/communication/vultisig/keysign/v1/keysign_message_pb';

import { getKeygenServerUrl } from '../../../keygen/server/utils/getKeygenServerUrl';
import { decompressQrPayload } from '../../../qr/upload/utils/decompressQrPayload';
import { getPayloadFromServer } from '../../../server/utils/getPayloadFromServer';

export const parseTransferredKeysignMsg = async (
  binary: Uint8Array
): Promise<KeysignMessage> => {
  const keysignMsg = fromBinary(KeysignMessageSchema, binary);

  if (keysignMsg.payloadId) {
    const serverType = keysignMsg.useVultisigRelay ? 'relay' : 'local';
    const serverUrl = await getKeygenServerUrl({
      serverType,
      serviceName: keysignMsg.serviceName,
    });

    const rawPayload = await getPayloadFromServer({
      hash: keysignMsg.payloadId,
      serverUrl,
    });
    const payload = await decompressQrPayload(rawPayload);

    keysignMsg.payloadId = '';
    keysignMsg.keysignPayload = fromBinary(KeysignPayloadSchema, payload);
  }

  return keysignMsg;
};
