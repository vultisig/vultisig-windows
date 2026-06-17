import styled from 'styled-components'

import {
  HomePromoBannerCloseButton,
  HomePromoBannerContent,
  HomePromoBannerTextStack,
} from '../shared/HomePromoBanner.styles'

/**
 * Blue-gradient promo card matching the VULT staking balance banner (concentric
 * glow rings bleed off the right edge via the self-positioned logo).
 */
export const BannerRoot = styled.div`
  position: relative;
  width: 100%;
  min-height: 134px;
  box-sizing: border-box;
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(95, 191, 255, 0.17);
  background: linear-gradient(
    180deg,
    rgba(95, 191, 255, 0.09) 0%,
    rgba(95, 191, 255, 0) 100%
  );
  overflow: hidden;
`

export const CloseButton = HomePromoBannerCloseButton

export const Content = HomePromoBannerContent

export const TextStack = HomePromoBannerTextStack
