import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate'
import { vultDiscountTiers } from '@vultisig/core-chain/swap/affiliate/config'

type HasReachedTierInput = {
  current: VultDiscountTier | null
  required: VultDiscountTier
}

/**
 * Whether the user's current discount tier is at least `required`. Tiers are
 * ordered bronze < silver < gold < … in `vultDiscountTiers`. A `null` current
 * tier (no qualifying balance) never satisfies the gate, and an unknown tier on
 * either side fails closed.
 */
export const hasReachedTier = ({
  current,
  required,
}: HasReachedTierInput): boolean => {
  if (current === null) return false

  const currentIndex = vultDiscountTiers.indexOf(current)
  const requiredIndex = vultDiscountTiers.indexOf(required)

  return (
    currentIndex >= 0 && requiredIndex >= 0 && currentIndex >= requiredIndex
  )
}
