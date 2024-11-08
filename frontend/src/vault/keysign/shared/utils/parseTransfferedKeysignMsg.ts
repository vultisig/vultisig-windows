import {
  KeysignMessage,
  KeysignPayload,
} from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { keygenServerUrl } from '../../../keygen/KeygenServerType';
import { decompressQrPayload } from '../../../qr/upload/utils/decompressQrPayload';
import { getPayloadFromServer } from '../../../server/utils/getPayloadFromServer';

export const parseTransferredKeysignMsg = async (
  binary: Uint8Array
): Promise<KeysignMessage> => {
  const keysignMsg = KeysignMessage.fromBinary(binary);

  if (keysignMsg.payloadId) {
    const serverType = keysignMsg.useVultisigRelay ? 'relay' : 'local';
    const serverUrl = keygenServerUrl[serverType];

    const rawPayload = await getPayloadFromServer({
      hash: keysignMsg.payloadId,
      serverUrl,
    });
    const payload = await decompressQrPayload(rawPayload);

    keysignMsg.payloadId = '';
    keysignMsg.keysignPayload = KeysignPayload.fromBinary(payload);
  }

  return keysignMsg;
};
