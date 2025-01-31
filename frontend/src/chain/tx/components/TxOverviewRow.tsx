import styled from 'styled-components';

import { hStack, vStack } from '../../../lib/ui/layout/Stack';
import { text } from '../../../lib/ui/text';

export const TxOverviewRow = styled.div`
  ${hStack({
    fullWidth: true,
    alignItems: 'center',
    justifyContent: 'space-between',
    wrap: 'wrap',
    gap: 20,
  })}

  ${text({
    weight: 600,
    size: 16,
    color: 'contrast',
    family: 'mono',
  })}

  > *:last-child {
    ${text({
      family: 'mono',
    })}
  }
`;

export const TxOverviewPrimaryRowTitle = styled.span`
  ${text({
    weight: 600,
    size: 20,
    color: 'contrast',
  })}
`;

export const TxOverviewChainDataRow = styled(TxOverviewRow)`
  ${vStack({
    alignItems: 'start',
    gap: 8,
  })}

  > *:last-child {
    ${text({
      family: 'mono',
      color: 'primary',
      size: 13,
      weight: 700,
    })}
    word-break: break-word;
  }
`;

export const TxOverviewRowDepositsFlow = styled.div`
  ${hStack({
    fullWidth: true,
    alignItems: 'center',
    justifyContent: 'space-between',
    wrap: 'wrap',
    gap: 6,
  })}

  ${text({
    weight: 700,
    size: 16,
  })}
`;

export const TxOverviewColumn = styled.div`
  ${vStack({
    fullWidth: true,
    justifyContent: 'space-between',
    wrap: 'wrap',
    gap: 6,
  })}

  ${text({
    weight: 700,
    size: 16,
  })}
`;
