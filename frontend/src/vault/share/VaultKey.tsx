import styled from 'styled-components';

import { HStack } from '../../lib/ui/layout/Stack';
import {
  ComponentWithValueProps,
  TitledComponentProps,
} from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';

const StyledText = styled(Text)`
  align-self: flex-start;
`;

export const VaultKey = ({
  value,
  title,
}: ComponentWithValueProps<string> & TitledComponentProps) => (
  <HStack alignItems="center" gap={4}>
    <StyledText size={16}>{title}:</StyledText>
    <Text size={16} style={{ overflowWrap: 'anywhere' }} centerHorizontally>
      {value}
    </Text>
  </HStack>
);
