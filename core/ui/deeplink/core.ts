import { fromBinary } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { tssMessageSchema, TssType } from '@core/mpc/types/utils/tssType'
import { KeygenMessage } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessage } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import {
  KeysignMessage,
  KeysignMessageSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { decompressQrPayload } from '@core/ui/qr/utils/decompressQrPayload'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getRawQueryParams } from '@lib/utils/query/getRawQueryParams'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'

type DeeplinkType = 'NewVault' | 'SignTransaction' | 'send'

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

type SendDeeplinkParams = {
  assetChain: string
  assetTicker: string
  toAddress: string
  amount?: string
  memo?: string
}

export type NewVaultData = {
  keygenMsg: KeygenMessage | ReshareMessage
  tssType: TssType
}

export type SignTransactionData = {
  keysignMsg: KeysignMessage
  vaultId: string
}

export type SendDeeplinkData = {
  chain: Chain
  ticker: string
  toAddress: string
  amount?: string
  memo?: string
}

export type ParsedDeeplink =
  | { newVault: NewVaultData }
  | { signTransaction: SignTransactionData }
  | { send: SendDeeplinkData }

export const parseDeeplink = async (url: string): Promise<ParsedDeeplink> => {
  if (/:\/\/send\?/.test(url)) {
    const queryParams = getRawQueryParams<SendDeeplinkParams>(url)

    const chain = shouldBePresent(
      Object.values(Chain).find(
        chain => areLowerCaseEqual(chain, queryParams.assetChain),
        'chain'
      )
    )

    return {
      send: {
        chain,
        ticker: shouldBePresent(queryParams.assetTicker, 'ticker'),
        toAddress: shouldBePresent(queryParams.toAddress, 'toAddress'),
        amount: queryParams.amount,
        memo: queryParams.memo,
      },
    }
  }

  const queryParams = getRawQueryParams<DeeplinkParams>(url)

  if (!('type' in queryParams)) {
    throw new Error(`Unknown deeplink: ${url}`)
  }

  const { type, jsonData } = queryParams
  const payload = await decompressQrPayload(jsonData)

  if (type === 'NewVault') {
    const keygenMsg = fromBinary(tssMessageSchema[queryParams.tssType], payload)

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
}
