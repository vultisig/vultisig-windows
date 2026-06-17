import {
  useDismissBanner,
  useDismissedBanners,
} from '@core/ui/storage/dismissedBanners'

import { StakeVultPromoBanner } from './StakeVultPromoBanner'
import { useStakeVultBannerEligibility } from './useStakeVultBannerEligibility'

/**
 * Standalone, self-gated placement of the stake-VULT nudge (e.g. the Discount
 * Tiers screen). Shares the carousel's dismissal state, so dismissing it in one
 * place hides it everywhere.
 */
export const StakeVultPromoBannerSlot = () => {
  const eligible = useStakeVultBannerEligibility()
  const { hasLoaded, isBannerDismissed } = useDismissedBanners()
  const dismissBanner = useDismissBanner()

  if (!hasLoaded || !eligible || isBannerDismissed('stakeVultPromo')) {
    return null
  }

  return (
    <StakeVultPromoBanner onDismiss={() => dismissBanner('stakeVultPromo')} />
  )
}
