import styled from 'styled-components';
import { centerContent } from '../../../lib/ui/css/centerContent';
import { getColor } from '../../../lib/ui/theme/getters';
import { borderRadius } from '../../../lib/ui/css/borderRadius';

export const QrImageDropZoneContainer = styled.div`
  flex: 1;
  height: 400px;
  width: 100%;
  max-height: 400px;
  ${centerContent};
  ${borderRadius.m};
  padding: 20px;
  border: 1px dashed ${getColor('primary')};
  background: ${({ theme }) =>
    theme.colors.primary.getVariant({ a: () => 0.14 }).toCssValue()};
`;
