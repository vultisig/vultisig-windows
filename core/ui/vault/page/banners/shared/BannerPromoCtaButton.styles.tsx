import { Button } from '@lib/ui/buttons/Button'
import styled from 'styled-components'

/**
 * The design system's mini success pill, used as the call to action inside the
 * home promo banners. Banners lay these out inline, so the label never wraps.
 */
export const BannerPromoCtaButton = styled(Button).attrs({
  size: 'xs' as const,
  status: 'success' as const,
})`
  white-space: nowrap;
`
