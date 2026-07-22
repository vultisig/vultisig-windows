import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { thornodeBaseUrl } from '../../../defi/chain/queries/constants'
import { fromThorchainFixedPoint, toThorchainFixedPoint } from './amount'

/**
 * Notional value the reference-price probe aims for.
 *
 * A probe sized to "1 unit" prices cheaply-denominated assets (RUNE, DOGE) below
 * THORChain's minimum swappable amount and comes back as a dust error instead of
 * a price. Quoting a realistic trade size also keeps the reported price closer
 * to what the user will actually get.
 */
const marketProbeFiatValue = 100

type GetMarketProbeAmountInput = {
  /** Fiat price of one natural unit of the source asset. */
  price: number
  decimals: number
}

/** Source amount, in native smallest units, to quote for a reference price. */
export const getMarketProbeAmount = ({
  price,
  decimals,
}: GetMarketProbeAmountInput): bigint => {
  const units = price > 0 ? marketProbeFiatValue / price : 1

  return BigInt(Math.max(1, Math.round(units * 10 ** decimals)))
}

type GetLimitSwapMarketPriceInput = {
  /** `expected_amount_out` from a THORChain quote, in 1e8 fixed point. */
  expectedAmountOut: string
  /** The amount that was quoted, in the source coin's native smallest units. */
  sourceAmount: bigint
  sourceDecimals: number
}

/**
 * Derive the market price — target natural units per source natural unit — from
 * a quote's expected output.
 *
 * THORChain reports `expected_amount_out` in 1e8 fixed point regardless of the
 * target chain's own decimals, so only the source side needs its decimals
 * applied. Kept pure so the scaling is unit-testable without a round trip.
 */
export const getLimitSwapMarketPrice = ({
  expectedAmountOut,
  sourceAmount,
  sourceDecimals,
}: GetLimitSwapMarketPriceInput): number => {
  const expected = fromThorchainFixedPoint(expectedAmountOut)
  if (!Number.isFinite(expected)) {
    throw new Error(
      `Invalid expected_amount_out from THORChain quote: ${expectedAmountOut}`
    )
  }

  const source = Number(sourceAmount) / 10 ** sourceDecimals
  if (source === 0) {
    throw new Error('Cannot derive a market price from a zero source amount')
  }

  return expected / source
}

type ThorchainQuoteResponse = {
  expected_amount_out: string
}

type FetchLimitSwapMarketPriceInput = {
  /** THORChain memo notation, e.g. `BTC.BTC`. */
  sourceAsset: string
  targetAsset: string
  /** Probe amount in the source coin's native smallest units. */
  sourceAmount: bigint
  sourceDecimals: number
  destinationAddress?: string
}

/**
 * Fetch the current market price for a limit-swap pair.
 *
 * Quotes with no affiliate and no liquidity tolerance: this reference price only
 * seeds the form's price field and presets, so any fee or slippage padding would
 * bias the number the user prices their order against. It is never broadcast.
 */
export const fetchLimitSwapMarketPrice = async ({
  sourceAsset,
  targetAsset,
  sourceAmount,
  sourceDecimals,
  destinationAddress,
}: FetchLimitSwapMarketPriceInput): Promise<number> => {
  const params = new URLSearchParams({
    from_asset: sourceAsset,
    to_asset: targetAsset,
    amount: toThorchainFixedPoint({
      amount: sourceAmount,
      decimals: sourceDecimals,
    }).toString(),
    streaming_interval: '1',
    streaming_quantity: '0',
    liquidity_tolerance_bps: '0',
  })

  if (destinationAddress) {
    params.set('destination', destinationAddress)
  }

  const { expected_amount_out } = await queryUrl<ThorchainQuoteResponse>(
    `${thornodeBaseUrl}/quote/swap?${params.toString()}`,
    { headers: { 'X-Client-ID': 'vultisig' } }
  )

  return getLimitSwapMarketPrice({
    expectedAmountOut: expected_amount_out,
    sourceAmount,
    sourceDecimals,
  })
}
