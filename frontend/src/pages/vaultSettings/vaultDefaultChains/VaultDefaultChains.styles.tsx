import styled from 'styled-components';

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import { borderRadius } from '../../../lib/ui/css/borderRadius';
import { Text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';

export const ChainBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
`;

export const ChainButton = styled(UnstyledButton)`
  display: grid;
  grid-template-columns: fit-content(200px) 1fr fit-content(200px);
  grid-template-rows: 1fr 1fr;
  column-gap: 16px;

  padding: 16px;
  ${borderRadius.m};
  background-color: ${getColor('foreground')};
  width: 100%;
`;

export const ColumnOneBothRowsItem = styled.img`
  grid-column: 1;
  grid-row: 1 / span 2;
  align-self: center;
`;

export const ColumnTwoRowOneItem = styled(Text)`
  grid-column: 2;
  grid-row: 1;
  text-align: start;
`;

export const ColumnTwoRowTwoItem = styled(Text)`
  grid-column: 2;
  grid-row: 2;
  text-align: start;
`;

export const ColumnThreeRowOneItem = styled.input`
  grid-column: 3;
  grid-row: 1 / span 2;
`;
