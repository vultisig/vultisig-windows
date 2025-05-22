import { Button } from '@lib/ui/buttons/Button'
import { UnstyledInput } from '@lib/ui/inputs/UnstyledInput'
import { Panel } from '@lib/ui/panel/Panel'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 32px;
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

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
