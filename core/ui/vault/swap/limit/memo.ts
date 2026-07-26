import { Coin } from '@vultisig/core-chain/coin/Coin'
import {
  buildLimitSwapMemo,
  LimitSwapExpiryHours,
} from '@vultisig/core-chain/swap/native/limitSwapMemo'
import { getThorchainMemoAsset } from '@vultisig/core-chain/swap/native/thorchainMemoAsset'

import { toThorchainFixedPoint } from './amount'

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
