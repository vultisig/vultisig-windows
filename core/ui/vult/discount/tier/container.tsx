import { ValueProp } from '@lib/ui/props'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import styled from 'styled-components'

type TierStyles = {
  footer: string
}

const tierStyles: Record<VultDiscountTier, TierStyles> = {
  bronze: {
    footer: 'linear-gradient(180deg, #993B1E 0%, #FF6333 100%)',
  },
  silver: {
    footer: 'linear-gradient(180deg, #7C8A9E 0%, #C9D6E8 100%)',
  },
  gold: {
    footer: 'linear-gradient(180deg, #997437 0%, #FFC25C 100%)',
  },
  platinum: {
    footer: 'linear-gradient(180deg, #4779FC 0%, #33E6BF 100%)',
  },
  diamond: {
    footer: 'linear-gradient(160deg, #9747FF 0%, #00CCFF 100%)',
  },
  ultimate: {
    footer: `linear-gradient(135deg, #031022 0%, #104AA0 25%, #FFC25C 47%, #FFFFFF 54%, #0F4594 73%, #E8B662 85%, #FFFAF3 100%)`,
  },
}

/** How much of the coloured footer stays tucked behind the dark section. */
export const discountTierFooterOverlap = 16

/** Total height of the coloured footer box. */
export const discountTierFooterHeight = 58

/** How many pixels of the coloured footer show while collapsed. */
export const discountTierFooterPeek = 3

export const DiscountTierContainer = styled.div<{ $clickable?: boolean }>`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: #061b3a;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`

export const DiscountTierDarkSection = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-radius: 16px;
  background: #061b3a;
`

export const DiscountTierContent = styled.div`
  display: flex;
  padding: 24px 20px;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  align-self: stretch;
`

export const DiscountTierFooterBox = styled.div<ValueProp<VultDiscountTier>>`
  position: relative;
  z-index: 0;
  align-self: stretch;
  height: ${discountTierFooterHeight}px;
  padding-top: ${discountTierFooterOverlap}px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  background: ${({ value }) => tierStyles[value].footer};

  color: #f0f4fc;
  text-align: center;
  font-family: Brockmann;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
`
