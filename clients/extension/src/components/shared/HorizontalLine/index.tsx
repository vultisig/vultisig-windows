import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const HorizontalLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${getColor('foregroundSuper')};
`
