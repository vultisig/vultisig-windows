import styled from 'styled-components'

import { BannerPromoCtaButton } from '../shared/BannerPromoCtaButton.styles'
import {
  HomePromoBannerCloseButton,
  HomePromoBannerContent,
  HomePromoBannerRoot,
  HomePromoBannerTextStack,
} from '../shared/HomePromoBanner.styles'

export const BannerContainer = styled(HomePromoBannerRoot)`
  border: none;
  background: linear-gradient(59deg, #061b3a 27.59%, #2155df 96.16%);
`

export const BackgroundPattern = styled.div`
  position: absolute;
  right: -10px;
  top: -10px;
  pointer-events: none;
`

export const ContentWrapper = HomePromoBannerContent

export const TextContent = styled(HomePromoBannerTextStack)`
  gap: 4px;
`

export const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const FollowButton = styled(BannerPromoCtaButton)`
  border-radius: 24px;
  background: linear-gradient(135deg, #4ade80 0%, #22d3ee 100%);
  color: #0f172a;
  font-weight: 600;
`

export const CloseButton = styled(HomePromoBannerCloseButton)`
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
`
