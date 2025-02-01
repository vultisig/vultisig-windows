import styled from 'styled-components';

import { toSizeUnit } from '../../../../lib/ui/css/toSizeUnit';
import { text } from '../../../../lib/ui/text';
import { amountConfig } from './config';

export const AmountLabel = styled.div`
  position: absolute;
  pointer-events: none;
  top: 6px;
  left: ${toSizeUnit(amountConfig.horizontalPadding)};
  ${text({
    size: 12,
    weight: 700,
    centerVertically: true,
  })}
`;
