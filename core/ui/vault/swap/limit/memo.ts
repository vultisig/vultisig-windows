import { Coin } from '@vultisig/core-chain/coin/Coin'
import {
  buildLimitSwapMemo,
  getLimitSwapLimitAmount,
  LimitSwapExpiryHours,
} from '@vultisig/core-chain/swap/native/limitSwapMemo'
import { getThorchainMemoAsset } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'

import { fromThorchainFixedPoint, toThorchainFixedPoint } from './amount'

type BuildLimitSwapMemoForCoinsInput = {
  fromCoin: Coin
  toCoin: Coin
  /** Source amount in the coin's native smallest units. */
  amount: bigint
  /** Target asset units per source unit, as the user entered it. */
  targetPrice: number | string
  expiryHours: LimitSwapExpiryHours
  /** Where the filled order pays out — the user's own address on the target chain. */
  destinationAddress: string
}

/**
 * Build the THORChain `=<` limit-order memo for a pair of vault coins.
 *
 * Bridges the app's `Coin` shape to the SDK's memo builder: derives THORChain
 * asset notation for both sides and rescales the source amount from native units
 * to the 1e8 fixed point the memo's LIM math assumes. The SDK owns the memo
 * format, LIM math, byte-cap fitting, and destination validation — this only
 * feeds it correctly.
 *
 * Throws rather than returning a partial memo: every failure here (unroutable
 * chain, unencodable asset, a LIM flooring to zero, an over-long memo) would
 * otherwise become a signed order that routes or prices differently than the
 * user asked for.
 */
export const buildLimitSwapMemoForCoins = ({
  fromCoin,
  toCoin,
  amount,
  targetPrice,
  expiryHours,
  destinationAddress,
}: BuildLimitSwapMemoForCoinsInput): string =>
  buildLimitSwapMemo({
    source_asset: getThorchainMemoAsset(fromCoin),
    source_amount: toThorchainFixedPoint({
      amount,
      decimals: fromCoin.decimals,
    }),
    target_asset: getThorchainMemoAsset(toCoin),
    dest_addr: destinationAddress,
    target_price: targetPrice,
    expiry_hours: expiryHours,
  })

type GetLimitSwapReceiveAmountInput = {
  fromCoin: Coin
  /** Source amount in the coin's native smallest units. */
  amount: bigint
  /** Target asset units per source unit, as the user entered it. */
  targetPrice: number | string
}

/**
 * The order's guaranteed-minimum output, in the target's natural units, for
 * display.
 *
 * Derived from the SDK's `getLimitSwapLimitAmount` — the exact truncated LIM the
 * memo encodes — rather than recomputing `amount × price` as a float. The two can
 * differ by the truncation, and showing a "you receive" figure the signed order
 * would not honor is the mismatch the issue calls out. Throws on the same
 * conditions as the memo (a LIM flooring to zero), so callers guard it the same
 * way they guard the memo.
 */
export const getLimitSwapReceiveAmount = ({
  fromCoin,
  amount,
  targetPrice,
}: GetLimitSwapReceiveAmountInput): number =>
  fromThorchainFixedPoint(
    getLimitSwapLimitAmount({
      source_amount: toThorchainFixedPoint({
        amount,
        decimals: fromCoin.decimals,
      }),
      target_price: targetPrice,
    })
  )
