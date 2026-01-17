import { fromBinary } from '@bufbuild/protobuf'
import { CustomMessagePayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/custom_message_payload_pb'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getPayloadFromServer } from '@core/ui/mpc/keygen/create/fast/server/utils/getPayloadFromServer'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { decompressQrPayload } from '@core/ui/qr/utils/decompressQrPayload'
import { useCore } from '@core/ui/state/core'
import { useMutation } from '@tanstack/react-query'

import { SignTransactionData } from '../core'

export const useProcessSignTransactionMutation = () => {
  const navigate = useCoreNavigate()
  const { getMpcServerUrl } = useCore()

  return useMutation({
    mutationFn: async (data: SignTransactionData) => {
      const { keysignMsg, vaultId } = data

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

      if (keysignMsg.customPayloadId) {
        const serverType = keysignMsg.useVultisigRelay ? 'relay' : 'local'
        const serverUrl = await getMpcServerUrl({
          serverType,
          serviceName: keysignMsg.serviceName,
        })

        const rawPayload = await getPayloadFromServer({
          hash: keysignMsg.customPayloadId,
          serverUrl,
        })
        const payload = await decompressQrPayload(rawPayload)

        keysignMsg.customPayloadId = ''
        keysignMsg.customMessagePayload = fromBinary(
          CustomMessagePayloadSchema,
          payload
        )
      }

      navigate(
        {
          id: 'joinKeysign',
          state: {
            keysignMsg,
            vaultId,
          },
        },
        {
          replace: true,
        }
      )
    },
  })
}
