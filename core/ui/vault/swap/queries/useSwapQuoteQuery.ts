import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useVultDiscountTierQuery } from '@core/ui/vult/discount/queries/tier'
import { useDebounce } from '@lib/ui/hooks/useDebounce'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'
import { pendingQuery } from '@lib/ui/query/Query'
import { keepPreviousData } from '@tanstack/react-query'
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

const quoteAmountDebounceMs = 300

type ShouldDebouncedSwapQuoteAmountShowPendingInput = {
  fromAmount: bigint | null
  debouncedFromAmount: bigint | null
}

/** Checks whether the quote UI should stay pending while amount debounce catches up. */
export const shouldDebouncedSwapQuoteAmountShowPending = ({
  fromAmount,
  debouncedFromAmount,
}: ShouldDebouncedSwapQuoteAmountShowPendingInput) =>
  fromAmount !== null && fromAmount > 0n && fromAmount !== debouncedFromAmount

type GetDebouncedSwapQuoteAmountInput = {
  fromAmount: bigint | null
  debouncedFromAmount: bigint | null
}

/** Returns the amount that is ready to drive a swap quote query. */
export const getDebouncedSwapQuoteAmount = ({
  fromAmount,
  debouncedFromAmount,
}: GetDebouncedSwapQuoteAmountInput) => {
  if (fromAmount === null || fromAmount === 0n) {
    return undefined
  }

  if (
    shouldDebouncedSwapQuoteAmountShowPending({
      fromAmount,
      debouncedFromAmount,
    })
  ) {
    return undefined
  }

  return fromAmount
}

export const useSwapQuoteQuery = () => {
  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const [fromAmount] = useFromAmount()
  const debouncedFromAmount = useDebounce(fromAmount, quoteAmountDebounceMs)
  const vaultId = useAssertCurrentVaultId()
  const referralQuery = useFriendReferralQuery(vaultId)

  const fromCoin = useCurrentVaultCoin(fromCoinKey)
  const toCoin = useCurrentVaultCoin(toCoinKey)

  const useVultDiscounts = currentProductBrand === 'vultisig'
  const vultDiscountTierQuery = useVultDiscountTierQuery({
    enabled: useVultDiscounts,
  })

  const notSameAsset = areEqualCoins(fromCoinKey, toCoinKey) ? undefined : true
  const shouldShowAmountPending = shouldDebouncedSwapQuoteAmountShowPending({
    fromAmount,
    debouncedFromAmount,
  })
  const quoteAmount = getDebouncedSwapQuoteAmount({
    fromAmount,
    debouncedFromAmount,
  })

  const query = useStateDependentQuery(
    {
      fromAmount: quoteAmount || undefined,
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
        placeholderData: keepPreviousData,
        retry: false,
      }
    }
  )

  return shouldShowAmountPending ? pendingQuery : query
}
