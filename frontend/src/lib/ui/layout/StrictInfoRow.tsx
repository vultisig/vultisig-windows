import styled from 'styled-components';

import { text } from '../text';
import { hStack } from './Stack';

export const StrictInfoRow = styled.div`
  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
    fullWidth: true,
  })}

  ${text({
    color: 'contrast',
    size: 12,
    weight: 700,
    family: 'mono',
  })}
`;
