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
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'

import { deeplinkRoutePattern } from './deeplinkRoutePattern'
import {
  DeeplinkQueryParams,
  getDeeplinkQueryParams,
} from './getDeeplinkQueryParams'

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
  memo: string
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

const tssTypes = getRecordKeys(tssMessageSchema)

const parseDepositDeeplink = ({
  assetChain,
  assetTicker,
  amount,
  memo,
}: DeeplinkQueryParams): DepositDeeplinkData => {
  const chainName = shouldBePresent(assetChain, 'assetChain')
  const chain = shouldBePresent(
    Object.values(Chain).find(
      chain =>
        areLowerCaseEqual(chain, chainName) &&
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

  const decodedMemo = memo ? decodeURIComponent(memo) : ''
  if (!decodedMemo.trim()) {
    throw new Error('Missing deeplink memo')
  }

  return {
    chain,
    ticker: assetTicker ?? chainFeeCoin[chain].ticker,
    amount,
    memo: decodedMemo,
  }
}

export const parseDeeplink = async (url: string): Promise<ParsedDeeplink> => {
  const queryParams = getDeeplinkQueryParams(url)

  if (deeplinkRoutePattern('send').test(url)) {
    const assetChain = shouldBePresent(queryParams.assetChain, 'assetChain')
    const chain = shouldBePresent(
      Object.values(Chain).find(chain => areLowerCaseEqual(chain, assetChain)),
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

  const { type } = queryParams

  if (type === 'Deposit') {
    return { deposit: parseDepositDeeplink(queryParams) }
  }
  const payload = await decompressQrPayload(
    shouldBePresent(queryParams.jsonData, 'jsonData')
  )

  if (type === 'NewVault') {
    const { tssType } = queryParams
    if (!isOneOf(tssType, tssTypes)) {
      throw new Error(`Invalid deeplink tssType: ${tssType}`)
    }

    const keygenMsg = fromBinary(tssMessageSchema[tssType], payload)

    return {
      newVault: {
        keygenMsg,
        tssType,
      },
    }
  }

  if (type === 'SignTransaction') {
    const keysignMsg = fromBinary(KeysignMessageSchema, payload)

    return {
      signTransaction: {
        keysignMsg,
        vaultId: shouldBePresent(queryParams.vault, 'vault'),
      },
    }
  }

  throw new Error(`Unknown deeplink type: ${type}`)
}
