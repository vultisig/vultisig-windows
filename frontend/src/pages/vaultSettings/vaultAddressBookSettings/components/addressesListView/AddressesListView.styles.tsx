import styled from 'styled-components';

import { Panel } from '../../../../../lib/ui/panel/Panel';
import { Text } from '../../../../../lib/ui/text';
import { getColor } from '../../../../../lib/ui/theme/getters';

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 32px;
`;

export const AddressBookListItem = styled(Panel)`
  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};

  display: grid;
  grid-template-columns: fit-content(200px) 1fr fit-content(200px);
  grid-template-rows: 1fr 1fr;
  column-gap: 8px;
`;

export const ItemText = styled(Text)`
  font-size: 14px;
`;

export const ColumnOneBothRowsItem = styled(ItemText)`
  grid-column: 1;
  grid-row: 1 / span 2;
`;

export const ColumnTwoRowOneItem = styled(ItemText)`
  grid-column: 2;
  grid-row: 1;
`;

export const ColumnTwoRowTwoItem = styled(ItemText)`
  grid-column: 2;
  grid-row: 2;
`;

export const ColumnThreeRowOneItem = styled(ItemText)`
  grid-column: 3;
  grid-row: 1;
`;
