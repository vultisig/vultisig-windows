import { ComponentWithValueProps } from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';
import { formatAmount } from '../../lib/utils/formatAmount';

export const VaultTotalBalance = ({
  value,
}: ComponentWithValueProps<number>) => {
  return (
    <Text color="contrast" weight="700" size={26}>
      ${formatAmount(value)}
    </Text>
  );
};
