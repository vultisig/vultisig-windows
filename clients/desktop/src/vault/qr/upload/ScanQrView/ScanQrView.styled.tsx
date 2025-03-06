import styled from 'styled-components'

import { PageContent } from '../../../../ui/page/PageContent'

export const Container = styled(PageContent)`
  /* @tony: added for optical alignment  */
  margin-top: -60px;
  position: relative;
  justify-content: flex-end;
  background-image: url('/assets/images/scanQRCodeBackground.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 0% 40%;
`

export const VideoWrapper = styled.div`
  position: relative;
  width: 365px;
  height: 365px;
`

export const BorderImageWrapper = styled.div`
  position: absolute;
  inset: -1.2px;

  & > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 40px;
  border: 1px solid rgba(72, 121, 253, 0.15);
  background: rgba(4, 36, 54, 0.3);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
`
