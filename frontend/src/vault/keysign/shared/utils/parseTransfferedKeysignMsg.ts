import {
  KeysignMessage,
  KeysignPayload,
} from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { decompressQrPayload } from '../../../qr/upload/utils/decompressQrPayload';
import { getPayloadFromServer } from '../../../server/utils/getPayloadFromServer';

export const parseTransferredKeysignMsg = async (
  binary: Uint8Array
): Promise<KeysignMessage> => {
  const keysignMsg = KeysignMessage.fromBinary(binary);

  if (keysignMsg.payloadId) {
    const rawPayload = await getPayloadFromServer({
      hash: keysignMsg.payloadId,
    });
    const payload = await decompressQrPayload(rawPayload);

    keysignMsg.payloadId = '';
    keysignMsg.keysignPayload = KeysignPayload.fromBinary(payload);
  }

  return keysignMsg;
};
