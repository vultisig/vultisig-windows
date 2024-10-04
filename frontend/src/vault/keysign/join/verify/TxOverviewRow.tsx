import styled from 'styled-components';

import { hStack } from '../../../../lib/ui/layout/Stack';
import { text } from '../../../../lib/ui/text';

export const TxOverviewRow = styled.div`
  ${hStack({
    fullWidth: true,
    alignItems: 'center',
    justifyContent: 'space-between',
    wrap: 'wrap',
    gap: 20,
  })}

  ${text({
    weight: 700,
    size: 16,
  })}
`;
