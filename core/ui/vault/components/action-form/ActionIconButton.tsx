import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ActionIconButton = styled(IconButton)`
  padding: 12px 16px;
  width: 103px;
  height: 46px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${borderRadius.s};

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`
