import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { AnimatedVisibility } from '../../../lib/ui/layout/AnimatedVisibility'
import { getColor } from '../../../lib/ui/theme/getters'

export const Wrapper = styled(AnimatedVisibility)`
  overflow-y: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const HorizontalLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${getColor('foregroundSuper')};
`

export const ScanQRCodeLink = styled(Link)`
  width: 100%;
`
