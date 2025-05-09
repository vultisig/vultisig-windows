import { fromBinary } from '@bufbuild/protobuf'
import {
  KeysignMessage,
  KeysignMessageSchema,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getPayloadFromServer } from '@core/ui/mpc/keygen/create/fast/server/utils/getPayloadFromServer'

import { getMpcServerUrl } from '../../../keygen/server/utils/getMpcServerUrl'
import { decompressQrPayload } from '../../../qr/upload/utils/decompressQrPayload'

export const parseTransferredKeysignMsg = async (
  binary: Uint8Array
): Promise<KeysignMessage> => {
  const keysignMsg = fromBinary(KeysignMessageSchema, binary)

  if (keysignMsg.payloadId) {
    const serverType = keysignMsg.useVultisigRelay ? 'relay' : 'local'
    const serverUrl = await getMpcServerUrl({
      serverType,
      serviceName: keysignMsg.serviceName,
    })

    const rawPayload = await getPayloadFromServer({
      hash: keysignMsg.payloadId,
      serverUrl,
    })
    const payload = await decompressQrPayload(rawPayload)

    keysignMsg.payloadId = ''
    keysignMsg.keysignPayload = fromBinary(KeysignPayloadSchema, payload)
  }

  return keysignMsg
}
