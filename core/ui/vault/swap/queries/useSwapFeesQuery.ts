import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/feeQuote/getFeeAmount'
import { getNativeSwapDecimals } from '@core/chain/swap/native/utils/getNativeSwapDecimals'
import { SwapFees } from '@core/chain/swap/SwapFee'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { useSwapFeeQuoteQuery } from './useSwapFeeQuoteQuery'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapFeesQuery = () => {
  const swapQuoteQuery = useSwapQuoteQuery()
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const feeQuoteQuery = useSwapFeeQuoteQuery()

  return useTransformQueriesData(
    {
      swapQuote: swapQuoteQuery,
      feeQuote: feeQuoteQuery,
    },
    ({ swapQuote, feeQuote }): SwapFees => {
      const { chain } = fromCoinKey
      const fromFeeCoin = chainFeeCoin[chain]

      const network = {
        ...fromFeeCoin,
        amount: getFeeAmount(chain, feeQuote),
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
                chain: chain,
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
