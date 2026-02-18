import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const CopyButton = styled(UnstyledButton)`
  padding: 2px;
  border-radius: 4px;
  color: ${getColor('textShy')};
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s ease;
  &:hover {
    color: ${getColor('text')};
  }
`
