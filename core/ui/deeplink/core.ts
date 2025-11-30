import { fromBinary } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { tssMessageSchema, TssType } from '@core/mpc/types/utils/tssType'
import { KeygenMessage } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessage } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'
import {
  KeysignMessage,
  KeysignMessageSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { decompressQrPayload } from '@core/ui/qr/utils/decompressQrPayload'
import { getRawQueryParams } from '@lib/utils/query/getRawQueryParams'

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
  type: 'send'
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
  const queryParams = getRawQueryParams<DeeplinkParams | SendDeeplinkParams>(
    url
  )

  if (!('type' in queryParams)) {
    throw new Error(`Unknown deeplink: ${url}`)
  }

  const { type } = queryParams

  if (type === 'send') {
    const sendParams = queryParams as SendDeeplinkParams

    if (
      !sendParams.assetChain ||
      !sendParams.assetTicker ||
      !sendParams.toAddress
    ) {
      throw new Error(
        `Missing required parameters for send deeplink: assetChain, assetTicker, and toAddress are required`
      )
    }

    const chain = assertChainField<Chain, { chain: string }>({
      chain: sendParams.assetChain,
    }).chain

    return {
      send: {
        chain,
        ticker: sendParams.assetTicker,
        toAddress: sendParams.toAddress,
        amount: sendParams.amount,
        memo: sendParams.memo,
      },
    }
  }

  const { jsonData } = queryParams as DeeplinkParams
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
