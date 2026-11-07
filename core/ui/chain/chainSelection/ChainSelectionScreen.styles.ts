import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const FullScreenContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${getColor('background')};
  z-index: 2;
`
