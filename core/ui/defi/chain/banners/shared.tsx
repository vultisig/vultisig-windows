import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { VStack } from '@lib/ui/layout/Stack'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const BannerContainer = styled.div`
  padding: 24px;
  border-radius: 20px;
  border: 1px solid ${getColor('foregroundExtra')};
  background:
    radial-gradient(
      circle at 30% 20%,
      rgba(50, 120, 255, 0.2),
      transparent 50%
    ),
    linear-gradient(140deg, rgba(8, 18, 43, 0.95) 0%, rgba(9, 28, 64, 0.9) 100%);
  position: relative;
  overflow: hidden;
`

export const BannerContent = styled(VStack)`
  position: relative;
  z-index: 1;
`

export const ChainLogo = styled.img`
  ${sameDimensions(32)};
  border-radius: 50%;
`

export const FallbackLogo = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('contrast')};
  font-weight: 600;
`

export const GradientBackground = styled.div`
  width: 260px;
  height: 260px;
  position: absolute;
  right: -90px;
  bottom: -110px;
  border-radius: 260px;
  opacity: 0.7;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(51, 204, 204, 0.35) 0%,
    rgba(2, 18, 43, 0) 100%
  );
  filter: blur(30px);
  pointer-events: none;
`

export const Ring = styled.div`
  position: absolute;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 255, 200, 0.35);
  right: -30px;
  top: -30px;
  box-shadow: 0 0 50px rgba(0, 255, 200, 0.25);
  pointer-events: none;
`

export const ThorchainLogoWrapper = styled.div`
  position: absolute;
  right: -50px;
  width: 145px;
  height: 145px;
  top: 20%;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200%;
    height: 200%;
    border-radius: 50%;

    pointer-events: none;
  }

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: 300px;
    height: 300px;
    top: -30%;
    right: -7%;
  }
`
