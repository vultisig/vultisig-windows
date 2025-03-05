import styled from 'styled-components'

import { hStack } from '../../../../../lib/ui/layout/Stack'
import { getColor } from '../../../../../lib/ui/theme/getters'

export const CheckIconWrapper = styled.div`
  ${hStack()}
  align-items: center;
  justify-content: center;
  padding: 1px;
  background-color: ${getColor('primary')};
  border-radius: 50%;
  font-size: 24px;
`
