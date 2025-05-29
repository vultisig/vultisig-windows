import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const CoinWrapper = styled(HStack)`
  cursor: pointer;
  padding: 6px;
  border-radius: 99px;
  background-color: ${getColor('foregroundExtra')};
`
