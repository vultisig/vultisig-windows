import { fromBinary } from '@bufbuild/protobuf'
import { decompressQrPayload } from '@core/ui/qr/utils/decompressQrPayload'
import { chainActionsRecord } from '@core/ui/vault/deposit/ChainAction'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import {
  tssMessageSchema,
  TssType,
} from '@vultisig/core-mpc/types/utils/tssType'
import { KeygenMessage } from '@vultisig/core-mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessage } from '@vultisig/core-mpc/types/vultisig/keygen/v1/reshare_message_pb'
import { SingleKeygenMessage } from '@vultisig/core-mpc/types/vultisig/keygen/v1/single_keygen_message_pb'
import {
  KeysignMessage,
  KeysignMessageSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { getRawQueryParams } from '@vultisig/lib-utils/query/getRawQueryParams'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'

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

type DepositDeeplinkParams = {
  assetChain: string
  assetTicker?: string
  amount?: string
  memo?: string
}

type SendDeeplinkParams = {
  assetChain: string
  assetTicker: string
  toAddress: string
  amount?: string
  memo?: string
}

export type NewVaultData = {
  keygenMsg: KeygenMessage | ReshareMessage | SingleKeygenMessage
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

/** A deposit (MsgDeposit) the link asks to prefill on the Custom action. */
export type DepositDeeplinkData = {
  chain: Chain
  ticker: string
  amount?: string
  memo?: string
}

export type ParsedDeeplink =
  | { newVault: NewVaultData }
  | { signTransaction: SignTransactionData }
  | { send: SendDeeplinkData }
  | { deposit: DepositDeeplinkData }

const customDepositChains = Object.entries(chainActionsRecord)
  .filter(([, actions]) => actions.includes('custom'))
  .map(([chain]) => chain)

const decimalAmountPattern = /^\d+(\.\d+)?$/

const tickerPattern = /^[A-Za-z0-9.-]{1,15}$/

/** Matches a link whose host is `route`, e.g. `vultisig://deposit?…`. */
export const deeplinkRoutePattern = (route: 'send' | 'deposit') =>
  new RegExp(`^[a-z]+://${route}\\?`, 'i')

const parseDepositDeeplink = (url: string): DepositDeeplinkData => {
  const { assetChain, assetTicker, amount, memo } =
    getRawQueryParams<DepositDeeplinkParams>(url)

  const chain = shouldBePresent(
    Object.values(Chain).find(
      chain =>
        areLowerCaseEqual(chain, assetChain) &&
        customDepositChains.includes(chain)
    ),
    'chain'
  )

  if (amount !== undefined && !decimalAmountPattern.test(amount)) {
    throw new Error(`Invalid deeplink amount: ${amount}`)
  }

  if (assetTicker !== undefined && !tickerPattern.test(assetTicker)) {
    throw new Error('Invalid deeplink ticker')
  }

  return {
    chain,
    ticker: assetTicker ?? chainFeeCoin[chain].ticker,
    amount,
    memo: memo ? decodeURIComponent(memo) : undefined,
  }
}

export const parseDeeplink = async (url: string): Promise<ParsedDeeplink> => {
  if (deeplinkRoutePattern('deposit').test(url)) {
    return { deposit: parseDepositDeeplink(url) }
  }

  if (/:\/\/send\?/.test(url)) {
    const queryParams = getRawQueryParams<SendDeeplinkParams>(url)

    const chain = shouldBePresent(
      Object.values(Chain).find(chain =>
        areLowerCaseEqual(chain, queryParams.assetChain)
      ),
      'chain'
    )

    return {
      send: {
        chain,
        ticker: shouldBePresent(queryParams.assetTicker, 'ticker'),
        toAddress: shouldBePresent(queryParams.toAddress, 'toAddress'),
        amount: queryParams.amount,
        memo: queryParams.memo
          ? decodeURIComponent(queryParams.memo)
          : undefined,
      },
    }
  }

  const queryParams = getRawQueryParams<DeeplinkParams>(url)

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
