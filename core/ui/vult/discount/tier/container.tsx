import { borderRadius, borderRadiusPx } from '@lib/ui/css/borderRadius'
import { ValueProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import styled from 'styled-components'

/** Per-tier brand gradient, shared by the tier footer and the feature-gate CTA. */
export const discountTierGradients: Record<VultDiscountTier, string> = {
  bronze: 'linear-gradient(180deg, #993B1E 0%, #FF6333 100%)',
  silver: 'linear-gradient(180deg, #7C8A9E 0%, #C9D6E8 100%)',
  gold: 'linear-gradient(180deg, #997437 0%, #FFC25C 100%)',
  platinum: 'linear-gradient(180deg, #4779FC 0%, #33E6BF 100%)',
  diamond: 'linear-gradient(160deg, #9747FF 0%, #00CCFF 100%)',
  ultimate: `linear-gradient(135deg, #031022 0%, #104AA0 25%, #FFC25C 47%, #FFFFFF 54%, #0F4594 73%, #E8B662 85%, #FFFAF3 100%)`,
}

/** How much of the coloured footer stays tucked behind the dark section. */
export const discountTierFooterOverlap = 22

/** Total height of the coloured footer box. */
export const discountTierFooterHeight = 70

/** The active tier's footer, a little taller around its check icon. */
export const discountTierActiveFooterHeight = 76

/** How many pixels of the coloured footer show while collapsed. */
export const discountTierFooterPeek = 1

/** One tier's card, clipping the footer that slides out from under it. */
export const DiscountTierContainer = styled.div<{ $clickable?: boolean }>`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  ${borderRadius.xl};
  background: #061b3a;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`

/** The dark upper part of a tier card; collapsed, the footer's edge stands in for its bottom border. */
export const DiscountTierDarkSection = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border: 1px solid ${getColor('foregroundExtra')};
  border-bottom-color: ${({ $isExpanded }) =>
    $isExpanded ? getColor('foregroundExtra') : 'transparent'};
  border-radius: ${borderRadiusPx.xl}px ${borderRadiusPx.xl}px 20px 20px;
  background: #061b3a;
  background-clip: padding-box;
`

/** A tier card's padded rows. */
export const DiscountTierContent = styled.div`
  display: flex;
  padding: 23px 19px;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  align-self: stretch;
`

/** The coloured strip under a tier card: its action, or that it is active. */
export const DiscountTierFooterBox = styled.div<ValueProp<VultDiscountTier>>`
  position: relative;
  z-index: 0;
  align-self: stretch;
  flex-shrink: 0;
  height: ${discountTierFooterHeight}px;
  padding-top: 32px;
  padding-bottom: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;

  background: ${({ value }) => discountTierGradients[value]};
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.1),
    inset 0 -1px 1px rgba(15, 28, 62, 0.48);

  color: #f0f4fc;
  text-align: center;
  font-family: Brockmann;
  font-size: 14px;
  font-weight: 600;
  line-height: 18px;
`
