import { Coin, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getNativeSwapDecimals } from '@vultisig/core-chain/swap/native/utils/getNativeSwapDecimals'
import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

import { SwapAffiliateBps } from '../affiliate/affiliateBps'

/**
 * The provider-side charges of a swap, itemized by who receives the money.
 *
 * `affiliate` is the only slot carrying money the product keeps, because it is
 * the slot the UI labels with the product's own name. Protocol, provider and
 * referrer charges must never be folded into it — that conflation is what made
 * a THORChain swap advertise Vultisig's cut as the composite `fees.total`.
 */
type SwapCharges = {
  affiliate?: SwapFee
  referral?: SwapFee
  protocol?: SwapFee
}

/** {@link SwapCharges} plus the basis a discount is valued against. */
export type SwapProviderFees = SwapCharges & {
  /**
   * Output the affiliate rate is charged on. Not a charge itself and never part
   * of the total — it exists so a discount can still be valued on routes where
   * the provider bakes its fee into the quoted rate and itemizes nothing.
   */
  affiliateNotional?: SwapFee
}

/** Every cost a swap incurs, source-chain gas included. */
export type SwapFeesBreakdown = SwapProviderFees & {
  network: SwapFee
}

/**
 * Flattens a breakdown into the entries a total should sum over. Slots are
 * listed explicitly so a non-charge field can never leak into the total.
 */
export const getSwapFeeEntries = ({
  network,
  affiliate,
  referral,
  protocol,
}: SwapFeesBreakdown): SwapFee[] =>
  [network, affiliate, referral, protocol].filter(
    (fee): fee is SwapFee => fee !== undefined
  )

type GetSwapProviderFeesInput = {
  quote: SwapQuoteResult
  toCoinKey: CoinKey
  toCoin: Coin | undefined
  fromCoin: Coin | undefined
  affiliateBps: SwapAffiliateBps
}

type GetSwapAffiliateNotionalInput = {
  quote: SwapQuoteResult
  toCoinKey: CoinKey
  toCoin: Coin | undefined
  affiliate: SwapFee | undefined
}

/**
 * The payout the affiliate rate applies to, grossed back up by the cut already
 * taken so a discount is measured against what the swap would have paid without
 * it. Denominated to match the affiliate fee of the same route, so both value
 * through the same price lookup.
 */
const getSwapAffiliateNotional = ({
  quote,
  toCoinKey,
  toCoin,
  affiliate,
}: GetSwapAffiliateNotionalInput): SwapFee | undefined =>
  matchRecordUnion<SwapQuoteResult, SwapFee | undefined>(quote, {
    native: ({ expected_amount_out }) => ({
      ...toCoinKey,
      amount: BigInt(expected_amount_out) + (affiliate?.amount ?? 0n),
      decimals: getNativeSwapDecimals(toCoinKey),
    }),
    general: ({ dstAmount }) =>
      toCoin
        ? {
            ...toCoinKey,
            amount: BigInt(dstAmount) + (affiliate?.amount ?? 0n),
            decimals: toCoin.decimals,
          }
        : undefined,
  })

/**
 * Splits a quote's provider-side charges into the product's affiliate cut, the
 * referrer's cut and everything the protocol keeps.
 *
 * Native quotes report `fees.affiliate` as the combined take of every affiliate
 * named in the memo, so the referrer's share is recovered pro-rata from the bps
 * that were sent. `protocol` is derived as `total - affiliate` rather than from
 * `fees.outbound`: that covers the liquidity fee the quote type does not expose
 * and guarantees the itemized rows still sum to the headline total.
 */
export const getSwapProviderFees = (
  input: GetSwapProviderFeesInput
): SwapProviderFees => {
  const charges = getSwapProviderCharges(input)
  const affiliateNotional = getSwapAffiliateNotional({
    ...input,
    affiliate: charges.affiliate,
  })

  return affiliateNotional ? { ...charges, affiliateNotional } : charges
}

const getSwapProviderCharges = ({
  quote,
  toCoinKey,
  fromCoin,
  affiliateBps,
}: GetSwapProviderFeesInput): SwapCharges =>
  matchRecordUnion<SwapQuoteResult, SwapCharges>(quote, {
    native: ({ fees }) => {
      const decimals = getNativeSwapDecimals(toCoinKey)
      const total = BigInt(fees.total)
      const reportedAffiliate = BigInt(fees.affiliate)
      // A quote should never charge more affiliate than it charges in total;
      // clamping keeps a malformed one from inflating the headline figure.
      const combinedAffiliate =
        reportedAffiliate > total ? total : reportedAffiliate
      const protocol = total - combinedAffiliate

      const { product, referral } = affiliateBps
      const requestedBps = product + referral
      const referralAmount =
        requestedBps > 0
          ? (combinedAffiliate * BigInt(referral)) / BigInt(requestedBps)
          : 0n

      return {
        affiliate: {
          ...toCoinKey,
          amount: combinedAffiliate - referralAmount,
          decimals,
        },
        ...(referralAmount > 0n
          ? { referral: { ...toCoinKey, amount: referralAmount, decimals } }
          : {}),
        ...(protocol > 0n
          ? { protocol: { ...toCoinKey, amount: protocol, decimals } }
          : {}),
      }
    },
    general: ({ tx }) =>
      matchRecordUnion<typeof tx, SwapCharges>(tx, {
        evm: ({ affiliateFee }) =>
          affiliateFee ? { affiliate: affiliateFee } : {},
        solana: ({ swapFee }) => ({ affiliate: swapFee }),
        // Deposit-channel transfers carry no affiliate metadata. The rate is
        // still known from the bps that were sent, so the row discloses the
        // percentage and reports the amount as part of the quoted rate.
        transfer: () => ({}),
        // RUJI Trade's FIN execute carries no fee fields: the protocol fee is
        // simulated on the contract and already netted out of the quote's
        // `dstAmount`, so there is nothing to disclose separately here.
        cosmosWasm: () => ({}),
        cowswap_order: ({ feeAmount }) => {
          const amount = BigInt(feeAmount)

          // CowSwap's `feeAmount` is the settlement cost the protocol charges
          // in the sell token. The product's cut rides in the order's appData
          // partner fee and is taken from surplus, so it never appears here —
          // labelling this as the affiliate fee would overstate our take.
          return amount > 0n && fromCoin
            ? {
                protocol: {
                  chain: fromCoin.chain,
                  id: fromCoin.id,
                  amount,
                  decimals: fromCoin.decimals,
                },
              }
            : {}
        },
      }),
  })

/** Input for {@link resolveSwapFees}. */
type ResolveSwapFeesInput = GetSwapProviderFeesInput & {
  network: SwapFee
}

/**
 * Maps a swap quote to the full itemized fee breakdown the UI renders.
 *
 * `network` is passed through untouched: it is the fee computed from the
 * keysign payload, and the co-signer's Verify screen holds nothing but that
 * payload. Folding the provider's own network-fee estimate in here (as the
 * Solana branch once did, taking the larger of the two) made the initiator
 * show a figure the co-signer could not reproduce — see vultisig-windows#4954.
 * A provider estimate that beats the computed fee belongs in the fee resolver
 * (vultisig-sdk#2397), where both screens pick it up.
 */
export const resolveSwapFees = ({
  network,
  ...providerFeesInput
}: ResolveSwapFeesInput): SwapFeesBreakdown => ({
  network,
  ...getSwapProviderFees(providerFeesInput),
})
