import styled from 'styled-components';

import { hStack } from '../../../lib/ui/layout/Stack';
import { strictText } from '../../../lib/ui/text';

export const StrictFeeRow = styled.div`
  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
    fullWidth: true,
  })}

  ${strictText}
`;
