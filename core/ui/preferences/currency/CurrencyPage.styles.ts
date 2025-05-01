import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const CurrencyBox = styled.div`
  align-items: flex-start;
  color: ${getColor('contrast')};
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: 16px;
  font-weight: 400;
`

export const CurrencyButton = styled(UnstyledButton)`
  align-items: center;
  background-color: ${getColor('foreground')};
  ${borderRadius.m};
  display: flex;
  justify-content: space-between;
  padding: 16px;
  width: 100%;
`
