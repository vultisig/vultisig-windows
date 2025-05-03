import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CheckStatus } from '@lib/ui/inputs/checkbox/CheckStatus'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ChainButton = styled(UnstyledButton)`
  display: grid;
  grid-template-columns: fit-content(200px) 1fr fit-content(200px);
  grid-template-rows: 1fr 1fr;
  column-gap: 16px;

  padding: 16px;
  ${borderRadius.m};
  background-color: ${getColor('foreground')};
  width: 100%;
`

export const ColumnOneBothRowsItem = styled.img`
  grid-column: 1;
  grid-row: 1 / span 2;
  align-self: center;
`

export const ColumnTwoRowOneItem = styled(Text)`
  grid-column: 2;
  grid-row: 1;
  text-align: start;
`

export const ColumnTwoRowTwoItem = styled(Text)`
  grid-column: 2;
  grid-row: 2;
  text-align: start;
`

export const Check = styled(CheckStatus)`
  ${sameDimensions(24)};
  grid-column: 3;
  grid-row: 1 / span 2;
  align-self: center;
`

export const HeaderWrapper = styled.div`
  background-color: ${getColor('background')};
  position: sticky;
  top: 0;
`
