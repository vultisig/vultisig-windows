import styled from 'styled-components'

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton'
import { borderRadius } from '../../../lib/ui/css/borderRadius'
import { getColor } from '../../../lib/ui/theme/getters'
import { PageSlice } from '../../../ui/page/PageSlice'

export const CurrencyBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
`

export const CurrencyButton = styled(UnstyledButton)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 16px;
  ${borderRadius.m};
  background-color: ${getColor('foreground')};
  width: 100%;
`

export const StyledPageSlice = styled(PageSlice)`
  margin-bottom: 16px;
`
