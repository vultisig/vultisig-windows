import { CoinKey } from '@core/chain/coin/Coin'
import { swapConfig } from '@core/chain/swap/config'
import { nativeSwapAffiliateConfig } from '@core/chain/swap/native/nativeSwapAffiliateConfig'
import { AffiliateParam } from '@core/chain/swap/native/NativeSwapQuote'
import { findSwapQuote } from '@core/chain/swap/quote/findSwapQuote'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { without } from '@lib/utils/array/without'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useActiveReferral } from '../../settings/referral/hooks/useActiveReferral'
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
  const { savedReferralName, hasReferral, appAffiliateBps, referrerBps } =
    useActiveReferral()

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

        const affiliates: AffiliateParam[] = hasReferral
          ? [
              {
                name: nativeSwapAffiliateConfig.affiliateFeeAddress,
                bps: isAffiliate ? appAffiliateBps : 0,
              },
              { name: savedReferralName!, bps: isAffiliate ? referrerBps : 0 },
            ]
          : [
              {
                name: nativeSwapAffiliateConfig.affiliateFeeAddress,
                bps: isAffiliate ? appAffiliateBps : 0,
              },
            ]

        return findSwapQuote({
          from: fromCoin,
          to: toCoin,
          amount: fromAmount,
          affiliates,
        })
      },
      retry: false,
    })
  )
}
