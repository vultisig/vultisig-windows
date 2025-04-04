import { VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const OverlayContent = styled(VStack)`
  background-color: ${getColor('foregroundDark')};
`

export const OverlayContentWrapper = styled(VStack)`
  padding: 0px 35px 48px 35px;
  background-color: ${getColor('foreground')};
  max-width: 800px;
`

export const RiveWrapper = styled.div`
  position: absolute;
  top: 181px;
  left: 160px;
  z-index: 3;
  width: 60px;
  height: 60px;
`

export const PhoneImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(42, 83, 150, 0.08);
`

export const OverlayWrapper = styled(VStack)`
  position: fixed;
  width: 100%;
  height: 100%;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
`

export const PhoneImageWrapper = styled(VStack)`
  position: relative;
  border-bottom-left-radius: 44px;
  border-bottom-right-radius: 44px;
  object-fit: contain;
  width: 600px;
  height: 450px;
  overflow: hidden;
  box-shadow:
    0px -1.284px 5.136px 0px rgba(255, 255, 255, 0.2) inset,
    -2.568px 0px 6.163px -3.852px rgba(255, 255, 255, 0.4) inset;
  padding: 0px 24px 24px 24px;
  background-color: ${getColor('foregroundExtra')};

  & > img {
    margin-top: -50px;
  }
`
