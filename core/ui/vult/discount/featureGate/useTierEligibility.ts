import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate'

import { useHighestVaultDiscountTier } from '../queries/anyVaultTier'
import { hasReachedTier } from '../tierOrder'

type UseTierEligibilityInput = {
  requiredTier: VultDiscountTier
}

type UseTierEligibilityResult = {
  isEligible: boolean
  isPending: boolean
}

/**
 * Shared tier-gate state for a Silver-tier (or higher) perk, evaluated across
 * ALL vaults via `useHighestVaultDiscountTier`. `isEligible` is not final
 * while `isPending` is true, so triggers should ignore taps until it settles.
 */
export const useTierEligibility = ({
  requiredTier,
}: UseTierEligibilityInput): UseTierEligibilityResult => {
  const { tier, isPending } = useHighestVaultDiscountTier()

  const isEligible = hasReachedTier({ current: tier, required: requiredTier })

  return { isEligible, isPending }
}
