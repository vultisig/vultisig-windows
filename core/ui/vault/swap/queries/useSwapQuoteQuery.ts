import { swapConfig } from '@core/chain/swap/config'
import {
  findSwapQuote,
  FindSwapQuoteInput,
} from '@core/chain/swap/quote/findSwapQuote'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useSwapAffiliateBpsQuery } from '@core/ui/vult/discount/queries/swapAffiliateBps'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { bigIntToNumber } from '@lib/utils/bigint/bigIntToNumber'

import { useAssertCurrentVaultId } from '../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../storage/referrals'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'

export const swapQuoteQueryKeyPrefix = 'swapQuote'

export const useSwapQuoteQuery = () => {
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const [fromAmount] = useFromAmount()
  const vaultId = useAssertCurrentVaultId()
  const referralQuery = useFriendReferralQuery(vaultId)

  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const fromCoinUsdPriceQuery = useCoinPriceQuery({
    coin: fromCoinKey,
    fiatCurrency: 'usd',
  })

  const appAffiliateBpsQuery = useSwapAffiliateBpsQuery()

  // If the price fails to load, proceed without the affiliate.
  const fromCoinUsdPrice = fromCoinUsdPriceQuery.error
    ? null
    : fromCoinUsdPriceQuery.data

  return useStateDependentQuery(
    {
      fromAmount: fromAmount || undefined,
      fromCoinUsdPrice,
      referral: referralQuery.data,
      affiliateBps: appAffiliateBpsQuery.data,
    },
    ({ fromAmount, fromCoinUsdPrice, referral, affiliateBps }) => {
      const fromAmountNumber =
        fromAmount !== undefined
          ? bigIntToNumber(fromAmount, fromCoin.decimals)
          : undefined

      const isAffiliate =
        fromCoinUsdPrice &&
        fromAmountNumber !== undefined &&
        fromAmountNumber * fromCoinUsdPrice >= swapConfig.minUsdAffiliateAmount

      const input: FindSwapQuoteInput = {
        from: fromCoin,
        to: toCoin,
        amount: shouldBePresent(fromAmount, 'fromAmount'),
        referral: referral ?? undefined,
        affiliateBps: isAffiliate ? affiliateBps : undefined,
      }

      return {
        queryKey: [swapQuoteQueryKeyPrefix, input],
        queryFn: async () => findSwapQuote(input),
        retry: false,
      }
    }
  )
}
