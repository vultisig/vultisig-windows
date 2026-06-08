import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

import { QbtcDappMessage } from './encodeAnyMessage'
import { qbtcFeeDenom } from './qbtcDirectConstants'

type QbtcDisplayAmount = { amount: string; decimals: number }

type RawCoin = { denom: string; amount: string }

const isRawCoin = (value: unknown): value is RawCoin =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as RawCoin).denom === 'string' &&
  typeof (value as RawCoin).amount === 'string'

/**
 * Pulls the native-denom coin out of a Cosmos message value. Most messages
 * (MsgSend, MsgDelegate, MsgDeposit, ...) carry it under `amount` as either a
 * single `Coin` or a `Coin[]`; IBC `MsgTransfer` uses `token`.
 */
const extractNativeCoins = (value: Record<string, unknown>): RawCoin[] => {
  const candidates = [value.amount, value.token].flatMap(field =>
    Array.isArray(field) ? field : [field]
  )

  return candidates
    .filter(isRawCoin)
    .filter(coin => coin.denom === qbtcFeeDenom)
}

/**
 * Derives the human-readable amount shown in the QBTC `sign_and_broadcast`
 * approval popup by summing the native-denom coins across every message. The
 * signed transaction always carries the exact amounts inside `bodyBytes`; this
 * is purely for the approval UI, which reads `transactionDetails.amount`.
 *
 * Returns `undefined` when no message carries a native coin (e.g. votes or
 * reward withdrawals), leaving the amount field empty rather than showing `0`.
 */
export const getQbtcDappAmount = (
  messages: QbtcDappMessage[]
): QbtcDisplayAmount | undefined => {
  const total = messages
    .flatMap(message => extractNativeCoins(message.value))
    .reduce((sum, coin) => sum + BigInt(coin.amount), 0n)

  if (total === 0n) {
    return undefined
  }

  return {
    amount: total.toString(),
    decimals: chainFeeCoin[Chain.QBTC].decimals,
  }
}
