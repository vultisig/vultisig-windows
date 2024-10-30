import { HStack } from '../../lib/ui/layout/Stack';
import {
  ComponentWithValueProps,
  TitledComponentProps,
} from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';

export const VaultKey = ({
  value,
  title,
}: ComponentWithValueProps<string> & TitledComponentProps) => (
  <HStack alignItems="center" gap={4}>
    <Text size={16} centerHorizontally>
      {title}:
    </Text>
    <Text size={16} style={{ overflowWrap: 'anywhere' }} centerHorizontally>
      {value}
    </Text>
  </HStack>
);
