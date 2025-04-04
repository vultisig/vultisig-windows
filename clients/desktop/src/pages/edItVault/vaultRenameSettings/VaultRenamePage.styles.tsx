import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const InputFieldWrapper = styled.div`
  position: relative;
  background-color: ${getColor('foreground')};
  padding: 12px;
  ${borderRadius.m};
`

export const InputField = styled.input`
  background-color: transparent;
  font-size: 16px;
  font-weight: 500;
  color: ${getColor('contrast')};
  display: block;
  width: 100%;

  &::placeholder {
    font-size: 18px;
    color: ${getColor('contrast')};
  }

  &:focus {
    outline: none;
  }
`

export const ButtonWithBottomSpace = styled(Button)`
  margin-bottom: 32px;
`
