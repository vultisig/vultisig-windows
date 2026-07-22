import { Coin, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getNativeSwapDecimals } from '@vultisig/core-chain/swap/native/utils/getNativeSwapDecimals'
import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapFee, SwapFees } from '@vultisig/core-chain/swap/SwapFee'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

/** Input for {@link resolveSwapFees}. */
type ResolveSwapFeesInput = {
  quote: SwapQuoteResult
  network: SwapFee
  toCoinKey: CoinKey
  fromCoin: Coin | undefined
}

/**
 * Maps a swap quote to its network + swap fee breakdown.
 *
 * Every branch keeps the caller-computed `network` fee. In particular the
 * `solana` branch must not fall back to the provider's `networkFee`, which is
 * `0n` whenever the quote carries no network-fee entry (e.g. SwapKit
 * CHAINFLIP_STREAMING) — the computed value from the keysign payload is the
 * real on-chain cost. See vultisig-windows#4381.
 */
export const resolveSwapFees = ({
  quote,
  network,
  toCoinKey,
  fromCoin,
}: ResolveSwapFeesInput): SwapFees =>
  matchRecordUnion<SwapQuoteResult, SwapFees>(quote, {
    native: ({ fees }) => ({
      swap: {
        ...toCoinKey,
        amount: BigInt(fees.total),
        decimals: getNativeSwapDecimals(toCoinKey),
      },
      network,
    }),
    general: ({ tx }) =>
      matchRecordUnion(tx, {
        evm: ({ affiliateFee }) => ({
          network,
          ...(affiliateFee ? { swap: affiliateFee } : {}),
        }),
        solana: ({ swapFee }) => ({
          network,
          swap: swapFee,
        }),
        transfer: () => ({ network }),
        cowswap_order: ({ feeAmount }) => {
          const swapAmount = BigInt(feeAmount)

          return {
            network,
            ...(swapAmount > 0n && fromCoin
              ? {
                  swap: {
                    chain: fromCoin.chain,
                    id: fromCoin.id,
                    amount: swapAmount,
                    decimals: fromCoin.decimals,
                  },
                }
              : {}),
          }
        },
      }),
  })
