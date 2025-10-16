import { swapConfig } from '@core/chain/swap/config'
import {
  findSwapQuote,
  FindSwapQuoteInput,
} from '@core/chain/swap/quote/findSwapQuote'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { useAssertCurrentVaultId } from '../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../storage/referrals'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { useSwapAffiliateBpsQuery } from './useSwapAffiliateBpsQuery'

export const swapQuoteQueryKeyPrefix = 'swapQuote'

export const useSwapQuoteQuery = () => {
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const [fromAmount] = useFromAmount()
  const vaultId = useAssertCurrentVaultId()
  const referralQuery = useFriendReferralQuery(vaultId)

  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const fromCoinUsdPrice = useCoinPriceQuery({
    coin: fromCoin,
    fiatCurrency: 'usd',
  })

  const appAffiliateBpsQuery = useSwapAffiliateBpsQuery()

  return useStateDependentQuery(
    {
      fromAmount: fromAmount || undefined,
      fromCoinUsdPrice: fromCoinUsdPrice.data,
      referral: referralQuery.data,
      affiliateBps: appAffiliateBpsQuery.data,
    },
    ({ fromAmount, fromCoinUsdPrice, referral, affiliateBps }) => {
      const usdAmount = fromAmount * fromCoinUsdPrice
      const isAffiliate = usdAmount >= swapConfig.minUsdAffiliateAmount

      const input: FindSwapQuoteInput = {
        from: fromCoin,
        to: toCoin,
        amount: fromAmount,
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

export const useSwapQuote = () => {
  const { data } = useSwapQuoteQuery()
  return shouldBePresent(data, 'swap quote query data')
}
