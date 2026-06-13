import { ValueProp } from '@lib/ui/props'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import styled from 'styled-components'

type TierStyles = {
  accent: string
  footer: string
}

const tierStyles: Record<VultDiscountTier, TierStyles> = {
  bronze: {
    accent: 'linear-gradient(90deg, rgba(50, 118, 217, 0.21) 0%, #DB5727 100%)',
    footer: 'linear-gradient(180deg, #993B1E 0%, #FF6333 100%)',
  },
  silver: {
    accent: 'linear-gradient(90deg, rgba(50, 118, 217, 0.22) 0%, #C9D6E8 100%)',
    footer: 'linear-gradient(180deg, #7C8A9E 0%, #C9D6E8 100%)',
  },
  gold: {
    accent: 'linear-gradient(90deg, rgba(50, 118, 217, 0.20) 0%, #FFC25C 100%)',
    footer: 'linear-gradient(180deg, #997437 0%, #FFC25C 100%)',
  },
  platinum: {
    accent: 'linear-gradient(90deg, #294772 2%, #4779FC 30%, #33E6BF 100%)',
    footer: 'linear-gradient(180deg, #4779FC 0%, #33E6BF 100%)',
  },
  diamond: {
    accent: 'linear-gradient(90deg, #9747FF 0%, #00CCFF 100%)',
    footer: 'linear-gradient(160deg, #9747FF 0%, #00CCFF 100%)',
  },
  ultimate: {
    accent: `linear-gradient(90deg, #031022 0%, #104AA0 25%, #FFC25C 47%, #FFFFFF 54%, #0F4594 73%, #E8B662 85%, #FFFAF3 100%)`,
    footer: `linear-gradient(135deg, #031022 0%, #104AA0 25%, #FFC25C 47%, #FFFFFF 54%, #0F4594 73%, #E8B662 85%, #FFFAF3 100%)`,
  },
}

export const discountTierFooterBackground = (value: VultDiscountTier): string =>
  tierStyles[value].footer

export const DiscountTierContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
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

export const DiscountTierAccent = styled.div<ValueProp<VultDiscountTier>>`
  height: 1px;
  align-self: stretch;
  background: ${({ value }) => tierStyles[value].accent};
`
