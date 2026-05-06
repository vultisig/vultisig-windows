import { IconButton } from '@lib/ui/buttons/IconButton'
import { vStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const HomePromoBannerRoot = styled.div`
  position: relative;
  width: 100%;
  height: 134px;
  box-sizing: border-box;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  overflow: hidden;
`

export const HomePromoBannerContent = styled.div`
  ${vStack({ gap: 12, justifyContent: 'center' })};
  position: relative;
  z-index: 2;
  height: 100%;
  align-items: flex-start;
`

export const HomePromoBannerTextStack = styled.div`
  ${vStack({ gap: 2 })};
  max-width: 214px;
`

export const HomePromoBannerCloseButton = styled(IconButton)`
  position: absolute;
  z-index: 3;
  top: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 77px;
  border: 1px solid ${getColor('mist')};
  background: ${getColor('mist')};
  backdrop-filter: blur(8px);
`
