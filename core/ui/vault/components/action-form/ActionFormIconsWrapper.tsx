import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ActionFormIconsWrapper = styled(HStack)`
  font-size: 16px;
`

export const ActionFormCheckBadge = styled.div`
  width: 16px;
  height: 16px;
  ${borderRadius.pill};
  border: 0.6667px solid ${getColor('success')};
  background: ${getColor('foreground')};
  color: ${getColor('success')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`
