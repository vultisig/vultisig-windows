import {
  findSwapQuote,
  FindSwapQuoteInput,
} from '@core/chain/swap/quote/findSwapQuote'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useVultDiscountTierQuery } from '@core/ui/vult/discount/queries/tier'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

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

  const vultDiscountTierQuery = useVultDiscountTierQuery()

  return useStateDependentQuery(
    {
      fromAmount: fromAmount || undefined,
      referral: referralQuery.data,
      vultDiscountTier: vultDiscountTierQuery.data,
    },
    ({ fromAmount, referral, vultDiscountTier }) => {
      const input: FindSwapQuoteInput = {
        from: fromCoin,
        to: toCoin,
        amount: shouldBePresent(fromAmount, 'fromAmount'),
        referral: referral ?? undefined,
        vultDiscountTier,
      }

      return {
        queryKey: [swapQuoteQueryKeyPrefix, input],
        queryFn: async () => findSwapQuote(input),
        retry: false,
      }
    }
  )
}
