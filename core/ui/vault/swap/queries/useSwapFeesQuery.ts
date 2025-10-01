import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getNativeSwapDecimals } from '@core/chain/swap/native/utils/getNativeSwapDecimals'
import { SwapFees } from '@core/chain/swap/SwapFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useToCoin } from '../state/toCoin'
import { useSwapChainSpecificQuery } from './useSwapChainSpecificQuery'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapFeesQuery = () => {
  const swapQuoteQuery = useSwapQuoteQuery()
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const [toCoinKey] = useToCoin()
  const chainSpecificQuery = useSwapChainSpecificQuery()

  return useTransformQueriesData(
    {
      swapQuote: swapQuoteQuery,
      chainSpecific: chainSpecificQuery,
    },
    ({ swapQuote, chainSpecific }): SwapFees => {
      const fromFeeCoin = chainFeeCoin[fromCoinKey.chain]

      const network = {
        ...fromFeeCoin,
        amount: getFeeAmount(chainSpecific),
        decimals: fromFeeCoin.decimals,
      }

      return matchRecordUnion(swapQuote, {
        native: ({ fees }) => {
          const swapAmount = BigInt(fees.total)

          return {
            swap: {
              ...toCoinKey,
              amount: swapAmount,
              decimals: getNativeSwapDecimals(toCoinKey),
            },
            network,
          }
        },
        general: ({ tx }) => {
          return matchRecordUnion(tx, {
            evm: () => ({
              network,
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
