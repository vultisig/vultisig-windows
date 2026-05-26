import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useVultDiscountTierQuery } from '@core/ui/vult/discount/queries/tier'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { areEqualCoins } from '@vultisig/core-chain/coin/Coin'
import { findSwapQuote } from '@vultisig/core-chain/swap/quote/findSwapQuote'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { currentProductBrand } from '../../../product/brand'
import { useAssertCurrentVaultId } from '../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../storage/referrals'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { buildSwapQuoteInput } from './buildSwapQuoteInput'

export const swapQuoteQueryKeyPrefix = 'swapQuote'

export const useSwapQuoteQuery = () => {
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const [fromAmount] = useFromAmount()
  const vaultId = useAssertCurrentVaultId()
  const referralQuery = useFriendReferralQuery(vaultId)

  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const useVultDiscounts = currentProductBrand === 'vultisig'
  const vultDiscountTierQuery = useVultDiscountTierQuery({
    enabled: useVultDiscounts,
  })

  const notSameAsset = areEqualCoins(fromCoinKey, toCoinKey) ? undefined : true

  return useStateDependentQuery(
    {
      fromAmount: fromAmount || undefined,
      referral: referralQuery.data,
      vultDiscountTier: useVultDiscounts ? vultDiscountTierQuery.data : null,
      notSameAsset,
    },
    ({ fromAmount, referral, vultDiscountTier }) => {
      const input = buildSwapQuoteInput({
        from: fromCoin,
        to: toCoin,
        amount: shouldBePresent(fromAmount, 'fromAmount'),
        referral,
        vultDiscountTier,
        productBrand: currentProductBrand,
      })

      return {
        queryKey: [swapQuoteQueryKeyPrefix, input],
        queryFn: async () => findSwapQuote(input),
        retry: false,
      }
    }
  )
}
