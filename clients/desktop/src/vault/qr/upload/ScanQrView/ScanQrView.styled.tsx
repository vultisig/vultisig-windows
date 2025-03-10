import styled from 'styled-components'

import { PageContent } from '../../../../ui/page/PageContent'

export const Container = styled(PageContent)`
  position: relative;
  justify-content: space-between;
`

export const VideoWrapper = styled.div`
  align-self: center;
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
