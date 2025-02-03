import styled from 'styled-components';

import { UnstyledButton } from '../../../lib/ui/buttons/UnstyledButton';
import {
  textInputBackground,
  textInputFrame,
} from '../../../lib/ui/css/textInput';
import { hStack, vStack } from '../../../lib/ui/layout/Stack';
import { Text, text } from '../../../lib/ui/text';
import { getColor } from '../../../lib/ui/theme/getters';

export const Container = styled(UnstyledButton)`
  ${textInputFrame};
  ${textInputBackground};

  color: ${getColor('contrast')};

  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
  })}

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`;

export const InputFieldWrapper = styled.div`
  ${textInputFrame};
  ${textInputBackground};
  font-family: monospace;
  color: ${getColor('contrast')};

  ${vStack({
    justifyContent: 'center',
  })}

  ${text({
    size: 14,
    color: 'contrast',
    family: 'mono',
  })}
`;

export const ErrorText = styled(Text)`
  display: inline-block;
  margin-top: -5px;
`;

export const AssetRequiredLabel = styled(Text)`
  align-self: flex-start;
`;
