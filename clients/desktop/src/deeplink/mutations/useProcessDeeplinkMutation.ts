import { fromBinary } from '@bufbuild/protobuf'
import { keygenMsgSchemaRecord, KeygenType } from '@core/mpc/keygen/KeygenType'
import { match } from '@lib/utils/match'
import { getRawQueryParams } from '@lib/utils/query/getRawQueryParams'
import { useMutation } from '@tanstack/react-query'

import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { parseTransferredKeysignMsg } from '../../vault/keysign/shared/utils/parseTransfferedKeysignMsg'
import { decompressQrPayload } from '../../vault/qr/upload/utils/decompressQrPayload'

type DeeplinkType = 'NewVault' | 'SignTransaction'

type DeeplinkSharedData = {
  jsonData: string
  vault: string
}

type DeeplinkParams = DeeplinkSharedData & {
  type: DeeplinkType
} & {
  tssType: KeygenType
} & {
  vault: string
}

export const useProcessDeeplinkMutation = () => {
  const navigate = useAppNavigate()

  return useMutation({
    mutationFn: async (url: string) => {
      const queryParams = getRawQueryParams<DeeplinkParams>(url)
      const { jsonData } = queryParams
      const payload = await decompressQrPayload(jsonData)

      if ('type' in queryParams) {
        return match(queryParams.type, {
          NewVault: async () => {
            const keygenType = queryParams.tssType

            const keygenMsg = fromBinary(
              keygenMsgSchemaRecord[keygenType],
              payload
            )

            navigate('joinKeygen', {
              state: {
                keygenType,
                keygenMsg,
              },
              replace: true,
            })
          },
          SignTransaction: async () => {
            const vaultId = queryParams.vault

            const keysignMsg = await parseTransferredKeysignMsg(payload)

            navigate('joinKeysign', {
              state: {
                keysignMsg,
                vaultId,
              },
              replace: true,
            })
          },
        })
      }

      throw new Error(`Unknown deeplink: ${url}`)
    },
  })
}
