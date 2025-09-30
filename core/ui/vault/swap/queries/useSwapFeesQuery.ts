import { UtxoChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getNativeSwapDecimals } from '@core/chain/swap/native/utils/getNativeSwapDecimals'
import { SwapFees } from '@core/chain/swap/SwapFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { useKeysignUtxoInfo } from '../../../mpc/keysign/utxo/queries/keysignUtxoInfo'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useToCoin } from '../state/toCoin'
import { useSwapChainSpecificQuery } from './useSwapChainSpecificQuery'
import { useSwapQuoteQuery } from './useSwapQuoteQuery'

export const useSwapFeesQuery = () => {
  const swapQuoteQuery = useSwapQuoteQuery()
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const [toCoinKey] = useToCoin()
  const chainSpecificQuery = useSwapChainSpecificQuery()
  const coin = useCurrentVaultCoin(fromCoinKey)
  const utxoInfoQuery = useKeysignUtxoInfo({
    chain: coin.chain,
    address: coin.address,
  })
  return useTransformQueriesData(
    {
      swapQuote: swapQuoteQuery,
      chainSpecific: chainSpecificQuery,
      utxoInfo: utxoInfoQuery,
    },
    ({ swapQuote, chainSpecific, utxoInfo }): SwapFees => {
      const fromFeeCoin = chainFeeCoin[fromCoinKey.chain]

      const network = {
        ...fromFeeCoin,
        amount: getFeeAmount({
          chainSpecific,
        }),
        decimals: fromFeeCoin.decimals,
      }

      return matchRecordUnion(swapQuote, {
        native: ({ fees }) => {
          const swapAmount = BigInt(fees.total)

          network.amount = getFeeAmount({
            chainSpecific,
            utxoInfo,
            amount: swapAmount,
            chain: fromCoinKey.chain as UtxoChain,
          })

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
