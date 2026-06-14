import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate'
import { vultDiscountTiers } from '@vultisig/core-chain/swap/affiliate/config'

/**
 * Whether the user's current discount tier is at least `required`. Tiers are
 * ordered bronze < silver < gold < … in `vultDiscountTiers`. A `null` current
 * tier (no qualifying balance) never satisfies the gate.
 */
export const hasReachedTier = (
  current: VultDiscountTier | null,
  required: VultDiscountTier
): boolean =>
  current !== null &&
  vultDiscountTiers.indexOf(current) >= vultDiscountTiers.indexOf(required)
