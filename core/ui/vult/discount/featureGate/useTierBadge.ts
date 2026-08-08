import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { useHighestVaultDiscountTier } from '../queries/anyVaultTier'
import { discountTierColors } from '../tier/colors'
import { hasReachedTier } from '../tierOrder'

type UseTierBadgeInput = {
  requiredTier: VultDiscountTier
}

export type TierBadgeContent = {
  color: string
  label: string
}

type UseTierBadgeResult = {
  isEligible: boolean
  isPending: boolean
  badge: TierBadgeContent | null
}

/**
 * Shared tier-gate state for a Silver-tier (or higher) perk, evaluated across
 * ALL vaults via `useHighestVaultDiscountTier`. Returns whether the user is
 * eligible plus the badge to render next to the trigger. While the tier query
 * is pending `badge` is `null` so the trigger does not flash a misleading
 * "required" badge before eligibility is known.
 */
export const useTierBadge = ({
  requiredTier,
}: UseTierBadgeInput): UseTierBadgeResult => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { tier, isPending } = useHighestVaultDiscountTier()

  const isEligible = hasReachedTier({ current: tier, required: requiredTier })

  const badge = isPending
    ? null
    : isEligible && tier
      ? {
          color: discountTierColors[tier].toCssValue(),
          label: t('vult_tier_label', { tier: t(tier) }),
        }
      : {
          color: theme.colors.textShy.toCssValue(),
          label: t('vult_tier_required', { tier: t(requiredTier) }),
        }

  return { isEligible, isPending, badge }
}
