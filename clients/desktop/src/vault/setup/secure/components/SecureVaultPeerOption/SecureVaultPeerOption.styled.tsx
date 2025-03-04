import styled from 'styled-components'

import { hStack } from '../../../../../lib/ui/layout/Stack'
import { Text } from '../../../../../lib/ui/text'
import { getColor } from '../../../../../lib/ui/theme/getters'

export const RiveWrapper = styled.div`
  flex-shrink: 0;
  height: 24px;
  width: 24px;
`

export const CheckIconWrapper = styled.div`
  ${hStack()}
  align-items: center;
  justify-content: center;
  padding: 1px;
  background-color: ${getColor('primary')};
  border-radius: 50%;
  font-size: 24px;
`

export const StyledText = styled(Text)`
  word-break: break-all;
`
