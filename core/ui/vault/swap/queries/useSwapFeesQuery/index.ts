import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { SwapFees } from '@core/chain/swap/SwapFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { useCoreViewState } from '../../../../navigation/hooks/useCoreViewState'
// NEW: prices + referral + input
import { useActiveReferral } from '../../../settings/referral/hooks/useActiveReferral'
import { useFromAmount } from '../../state/fromAmount'
import { useToCoin } from '../../state/toCoin'
import { useSwapChainSpecificQuery } from '../useSwapChainSpecificQuery'
import { useSwapQuoteQuery } from '../useSwapQuoteQuery'
import { calcReferralDeltaInToAsset } from './utils/calcReferralDeltaInToAsset'

export const useSwapFeesQuery = () => {
  const swapQuoteQuery = useSwapQuoteQuery()

  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const fromCoin = useCurrentVaultCoin(fromCoinKey)

  const [toCoinKey] = useToCoin()
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const chainSpecificQuery = useSwapChainSpecificQuery()

  // Inputs needed for the friend 10 bps delta
  const [fromAmount] = useFromAmount()
  const fromUsd = useCoinPriceQuery({
    coin: fromCoin,
    fiatCurrency: 'usd',
  }).data
  const toUsd = useCoinPriceQuery({ coin: toCoin, fiatCurrency: 'usd' }).data
  const { hasReferral, referrerBps } = useActiveReferral()

  return useTransformQueriesData(
    {
      swapQuote: swapQuoteQuery,
      chainSpecific: chainSpecificQuery,
    },
    ({ swapQuote, chainSpecific }): SwapFees => {
      const fromFeeCoin = chainFeeCoin[fromCoinKey.chain]

      return matchRecordUnion(swapQuote, {
        native: ({ fees, swapChain }) => {
          const networkFeeAmount = getFeeAmount(chainSpecific)

          let swapAmount = BigInt(fees.total)

          const isThor = swapChain === 'THORChain'
          if (isThor) {
            const delta = calcReferralDeltaInToAsset({
              hasReferral,
              referrerBps,
              fromAmount,
              fromUsdPrice: fromUsd,
              toUsdPrice: toUsd,
              toDecimals: toCoin.decimals,
            })
            swapAmount = swapAmount + delta
          }

          return {
            swap: {
              ...toCoinKey,
              amount: swapAmount,
              decimals: toCoin.decimals,
            },
            network: {
              ...fromFeeCoin,
              amount: networkFeeAmount,
              decimals: fromFeeCoin.decimals,
            },
          }
        },

        // non-THOR native routes stay as they were
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
