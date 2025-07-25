import { CoinKey } from '@core/chain/coin/Coin'
import { swapConfig } from '@core/chain/swap/config'
import { findSwapQuote } from '@core/chain/swap/quote/findSwapQuote'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { without } from '@lib/utils/array/without'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useFromAmount } from '../state/fromAmount'
import { useToCoin } from '../state/toCoin'

type GetSwapQuoteQueryKey = {
  fromCoinKey: CoinKey
  toCoinKey: CoinKey
  fromAmount: number
}

export const getSwapQuoteQueryKey = ({
  fromCoinKey,
  toCoinKey,
  fromAmount,
}: GetSwapQuoteQueryKey) =>
  without(['swapQuote', fromCoinKey, toCoinKey, fromAmount], null, undefined)

export const useSwapQuoteQuery = () => {
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const [toCoinKey] = useToCoin()
  const [fromAmount] = useFromAmount()

  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const fromCoinUsdPrice = useCoinPriceQuery({
    coin: fromCoin,
    fiatCurrency: 'usd',
  })

  return useStateDependentQuery(
    {
      fromAmount: fromAmount || undefined,
      fromCoinUsdPrice: fromCoinUsdPrice.data,
    },
    ({ fromAmount, fromCoinUsdPrice }) => ({
      queryKey: getSwapQuoteQueryKey({
        fromCoinKey,
        toCoinKey,
        fromAmount,
      }),
      queryFn: async () => {
        const usdAmount = fromAmount * fromCoinUsdPrice

        const isAffiliate = usdAmount >= swapConfig.minUsdAffiliateAmount

        return findSwapQuote({
          from: fromCoin,
          to: toCoin,
          amount: fromAmount,
          isAffiliate,
        })
      },
      retry: false,
    })
  )
}
