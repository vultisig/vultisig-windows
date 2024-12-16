import { HStack, VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';

export const KeysignTxOverviewRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) =>
  value ? (
    <VStack gap={16}>
      <HStack alignItems="center" gap={4}>
        <Text weight="600" size={20} color="contrast">
          {label}
        </Text>
      </HStack>
      <Text family="mono" color="primary" size={14} weight="400">
        {value}
      </Text>
    </VStack>
  ) : null;
