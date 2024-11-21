import styled from 'styled-components';

import { textInputFrame } from '../../../../lib/ui/css/textInput';
import { hStack } from '../../../../lib/ui/layout/Stack';
import { text } from '../../../../lib/ui/text';
import { getColor } from '../../../../lib/ui/theme/getters';

export const FeeContainer = styled.div`
  ${textInputFrame};
  background: ${getColor('foreground')};

  ${text({
    color: 'supporting',
    weight: 600,
    size: 16,
  })}
  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
  })}
`;
