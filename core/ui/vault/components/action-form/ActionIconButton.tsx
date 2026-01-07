import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ActionIconButton = styled(IconButton)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  height: 46px;
  font-size: 20px;
  padding: 12px 16px;
  width: 103px;
  ${borderRadius.s};

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
