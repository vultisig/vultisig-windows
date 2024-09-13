import { VStack } from '../../lib/ui/layout/Stack';
import {
  ComponentWithValueProps,
  TitledComponentProps,
} from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';

export const VaultKey = ({
  value,
  title,
}: ComponentWithValueProps<string> & TitledComponentProps) => (
  <VStack alignItems="center">
    <Text weight={600} size={16} centerHorizontally>
      {title}
    </Text>
    <Text size={12} style={{ overflowWrap: 'anywhere' }} centerHorizontally>
      {value}
    </Text>
  </VStack>
);
