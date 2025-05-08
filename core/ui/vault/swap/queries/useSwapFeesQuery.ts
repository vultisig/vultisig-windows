import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { SwapFees } from '@core/chain/swap/SwapFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { useFromCoin } from '../state/fromCoin'
import { useToCoin } from '../state/toCoin'
import { useSwapChainSpecificQuery } from './useSwapChainSpecificQuery'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapFeesQuery = () => {
  const swapQuoteQuery = useSwapQuoteQuery()

  const [fromCoinKey] = useFromCoin()
  const [toCoinKey] = useToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const chainSpecificQuery = useSwapChainSpecificQuery()

  return useTransformQueriesData(
    {
      swapQuote: swapQuoteQuery,
      chainSpecific: chainSpecificQuery,
    },
    ({ swapQuote, chainSpecific }): SwapFees => {
      const fromFeeCoin = chainFeeCoin[fromCoinKey.chain]

      return matchRecordUnion(swapQuote, {
        native: ({ fees }) => {
          const feeAmount = getFeeAmount(chainSpecific)

          const result: SwapFees = {
            swap: {
              ...toCoinKey,
              amount: BigInt(fees.total),
              decimals: toCoin.decimals,
            },
            network: {
              ...fromFeeCoin,
              amount: feeAmount,
              decimals: fromFeeCoin.decimals,
            },
          }

          return result
        },
        general: ({ tx }) => {
          return matchRecordUnion(tx, {
            evm: ({ gasPrice, gas }) => ({
              swap: {
                chain: fromCoinKey.chain,
                id: fromCoinKey.id,
                amount: BigInt(gasPrice) * BigInt(gas),
                decimals: fromFeeCoin.decimals,
              },
            }),
            solana: ({ networkFee, swapFee }) => ({
              network: {
                chain: fromCoinKey.chain,
                id: fromCoinKey.id,
                amount: BigInt(networkFee),
                decimals: fromFeeCoin.decimals,
              },
              swap: swapFee,
            }),
          })
        },
      })
    }
  )
}
