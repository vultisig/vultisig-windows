import {
  findSwapQuote,
  FindSwapQuoteInput,
} from '@core/chain/swap/quote/findSwapQuote'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useSwapAffiliateBpsQuery } from '@core/ui/vult/discount/queries/swapAffiliateBps'
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

  const appAffiliateBpsQuery = useSwapAffiliateBpsQuery()

  return useStateDependentQuery(
    {
      fromAmount: fromAmount || undefined,
      referral: referralQuery.data,
      affiliateBps: appAffiliateBpsQuery.data,
    },
    ({ fromAmount, referral, affiliateBps }) => {
      const input: FindSwapQuoteInput = {
        from: fromCoin,
        to: toCoin,
        amount: shouldBePresent(fromAmount, 'fromAmount'),
        referral: referral ?? undefined,
        affiliateBps,
      }

      return {
        queryKey: [swapQuoteQueryKeyPrefix, input],
        queryFn: async () => findSwapQuote(input),
        retry: false,
      }
    }
  )
}
