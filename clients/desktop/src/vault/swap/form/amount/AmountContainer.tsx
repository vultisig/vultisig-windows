import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { textInputBorderRadius } from '../../../../lib/ui/css/textInput'

export const AmountContainer = styled.div`
  position: relative;
  ${textInputBorderRadius};
  background: ${getColor('foreground')};
  height: 60px;
`
