import styled from 'styled-components'

export const VideoWrapper = styled.div`
  align-self: center;
  height: 368px;
  position: relative;
  width: 368px;
`

export const BorderImageWrapper = styled.div`
  inset: -1.2px;
  position: absolute;

  & > img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
`

export const Video = styled.video`
  background: rgba(4, 36, 54, 0.3);
  border: 1px solid rgba(72, 121, 253, 0.15);
  border-radius: 40px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  height: 100%;
  object-fit: cover;
  width: 100%;
`
