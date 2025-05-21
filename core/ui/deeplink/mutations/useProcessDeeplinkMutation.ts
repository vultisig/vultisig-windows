import { fromBinary } from '@bufbuild/protobuf'
import {
  fromTssType,
  tssMessageSchema,
  TssType,
} from '@core/mpc/types/utils/tssType'
import {
  KeysignMessageSchema,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { decompressQrPayload } from '@core/ui/qr/upload/utils/decompressQrPayload'
import { match } from '@lib/utils/match'
import { getRawQueryParams } from '@lib/utils/query/getRawQueryParams'
import { useMutation } from '@tanstack/react-query'

import { getPayloadFromServer } from '../../mpc/keygen/create/fast/server/utils/getPayloadFromServer'
import { useCore } from '../../state/core'

type DeeplinkType = 'NewVault' | 'SignTransaction'

type DeeplinkSharedData = {
  jsonData: string
  vault: string
}

type DeeplinkParams = DeeplinkSharedData & {
  type: DeeplinkType
} & {
  tssType: TssType
} & {
  vault: string
}

export const useProcessDeeplinkMutation = () => {
  const navigate = useCoreNavigate()

  const { getMpcServerUrl } = useCore()

  return useMutation({
    mutationFn: async (url: string) => {
      const queryParams = getRawQueryParams<DeeplinkParams>(url)
      const { jsonData } = queryParams
      const payload = await decompressQrPayload(jsonData)

      if ('type' in queryParams) {
        return match(queryParams.type, {
          NewVault: async () => {
            const keygenMsg = fromBinary(
              tssMessageSchema[queryParams.tssType],
              payload
            )

            const keygenType = fromTssType(queryParams.tssType)

            navigate(
              {
                id: 'joinKeygen',
                state: {
                  keygenType,
                  keygenMsg,
                },
              },
              {
                replace: true,
              }
            )
          },
          SignTransaction: async () => {
            const vaultId = queryParams.vault

            const keysignMsg = fromBinary(KeysignMessageSchema, payload)

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
              keysignMsg.keysignPayload = fromBinary(
                KeysignPayloadSchema,
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

      throw new Error(`Unknown deeplink: ${url}`)
    },
  })
}
