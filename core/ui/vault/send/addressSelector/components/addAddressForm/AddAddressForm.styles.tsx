import { Button } from '@lib/ui/buttons/Button'
import { UnstyledInput } from '@lib/ui/inputs/UnstyledInput'
import { Panel } from '@lib/ui/panel/Panel'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const FormField = styled(Panel)`
  font-weight: 400;
  font-size: 16px;

  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const FormFieldLabel = styled.label`
  font-weight: 500;
  color: ${getColor('contrast')};
  display: inline-block;
  margin-bottom: 6px;
`

export const FormInput = styled(UnstyledInput)`
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};

  &::placeholder {
    font-size: 13px;
    color: ${getColor('textShy')};
  }
`

export const AddButton = styled(Button)`
  width: 100%;
`

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`
