import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { VStack } from '@lib/ui/layout/Stack'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const BannerContainer = styled.div`
  padding: 24px;
  position: relative;
  overflow: hidden;
  min-height: 122px;
  border-radius: 16px;
  border: 1px solid rgba(52, 230, 191, 0.17);
  background: linear-gradient(
    180deg,
    rgba(52, 230, 191, 0.09) 0%,
    rgba(29, 128, 106, 0) 100%
  );
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
  width: 200px;
  height: 200px;
  top: 0%;

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: 300px;
    height: 300px;
    top: -40%;
    right: -7%;
  }
`

export const MayachainBannerContainer = styled.div`
  padding: 24px;
  position: relative;
  overflow: hidden;
  min-height: 122px;
  border-radius: 16px;
  border: 1px solid rgba(28, 157, 125, 0.17);
  background: linear-gradient(
    180deg,
    rgba(28, 157, 125, 0.09) 0%,
    rgba(17, 40, 74, 0) 100%
  );
`

export const MayachainLogoWrapper = styled.div`
  position: absolute;
  right: 0;
  width: 120px;
  height: 120px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.8;

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: 160px;
    height: 160px;
    right: 20px;
  }
`

export const ChainTitle = styled(Text)`
  font-family: Brockmann, sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
  letter-spacing: -0.09px;
  text-align: center;
`

export const BalanceValue = styled(Text)`
  font-family: Satoshi, sans-serif;
  font-size: 28px;
  font-weight: 500;
  line-height: 34px;
  letter-spacing: -0.56px;
  text-align: center;
`
