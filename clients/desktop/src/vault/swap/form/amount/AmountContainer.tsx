import styled from 'styled-components';

import { textInputBorderRadius } from '../../../../lib/ui/css/textInput';
import { getColor } from '../../../../lib/ui/theme/getters';

export const AmountContainer = styled.div`
  position: relative;
  ${textInputBorderRadius};
  background: ${getColor('foreground')};
  height: 60px;
`;
