import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import {
  HomePromoBannerCloseButton,
  HomePromoBannerContent,
  HomePromoBannerRoot,
  HomePromoBannerTextStack,
} from '../shared/HomePromoBanner.styles'

export const BannerRoot = styled(HomePromoBannerRoot)``

export const CloseButton = HomePromoBannerCloseButton

export const Content = HomePromoBannerContent

export const TextStack = HomePromoBannerTextStack

export const IllustrationGlow = styled.div`
  position: absolute;
  z-index: 0;
  top: -32px;
  right: -58px;
  width: 228px;
  height: 228px;
  border-radius: 50%;
  background: radial-gradient(
    50% 50% at 50% 50%,
    ${getColor('primaryAlt')} 0%,
    transparent 72%
  );
  opacity: 0.18;
  filter: blur(18px);
  pointer-events: none;
`

export const IllustrationImage = styled.img`
  position: absolute;
  z-index: 1;
  top: 8px;
  right: -7px;
  width: 167px;
  pointer-events: none;
  user-select: none;
`
