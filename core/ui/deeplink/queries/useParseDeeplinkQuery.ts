import { fromBinary } from '@bufbuild/protobuf'
import { tssMessageSchema, TssType } from '@core/mpc/types/utils/tssType'
import { KeygenMessage } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessage } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import {
  KeysignMessage,
  KeysignMessageSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { decompressQrPayload } from '@core/ui/qr/utils/decompressQrPayload'
import { Query } from '@lib/ui/query/Query'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { getRawQueryParams } from '@lib/utils/query/getRawQueryParams'
import { useQuery } from '@tanstack/react-query'

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

export type NewVaultData = {
  keygenMsg: KeygenMessage | ReshareMessage
  tssType: TssType
}

export type SignTransactionData = {
  keysignMsg: KeysignMessage
  vaultId: string
}

export type ParsedDeeplink =
  | { newVault: NewVaultData }
  | { signTransaction: SignTransactionData }

export const useParseDeeplinkQuery = (url: string): Query<ParsedDeeplink> => {
  return useQuery({
    queryKey: ['parse-deeplink', url],
    queryFn: async () => {
      const queryParams = getRawQueryParams<DeeplinkParams>(url)

      if (!('type' in queryParams)) {
        throw new Error(`Unknown deeplink: ${url}`)
      }

      const { jsonData, type } = queryParams
      const payload = await decompressQrPayload(jsonData)

      if (type === 'NewVault') {
        const keygenMsg = fromBinary(
          tssMessageSchema[queryParams.tssType],
          payload
        )

        return {
          newVault: {
            keygenMsg,
            tssType: queryParams.tssType,
          },
        }
      }

      if (type === 'SignTransaction') {
        const keysignMsg = fromBinary(KeysignMessageSchema, payload)

        return {
          signTransaction: {
            keysignMsg,
            vaultId: queryParams.vault,
          },
        }
      }

      throw new Error(`Unknown deeplink type: ${type}`)
    },
    ...noRefetchQueryOptions,
    retry: false,
  })
}
