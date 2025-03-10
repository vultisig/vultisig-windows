import styled from 'styled-components'

import { Button } from '../../../../lib/ui/buttons/Button'
import { UnstyledButton } from '../../../../lib/ui/buttons/UnstyledButton'
import { borderRadius } from '../../../../lib/ui/css/borderRadius'
import { VStack } from '../../../../lib/ui/layout/Stack'
import { getColor } from '../../../../lib/ui/theme/getters'

export const InputFieldWrapper = styled.div`
  position: relative;
  background-color: ${getColor('foreground')};
  ${borderRadius.m};
`

export const InputField = styled.input`
  padding: 12px;
  background-color: transparent;
  display: block;
  width: 100%;
  color: ${getColor('text')};

  &::placeholder {
    font-size: 13px;
    color: ${getColor('textShy')};
  }

  &:focus {
    outline: none;
  }
`

export const IconButton = styled(UnstyledButton)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
`

export const ActionsWrapper = styled(VStack)`
  margin-bottom: 32px;
`

export const InfoPill = styled(Button)`
  pointer-events: none;
  justify-content: flex-start;
  gap: 4px;
  height: 40px;
`
