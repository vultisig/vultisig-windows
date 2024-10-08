import { VStack } from '../../../../lib/ui/layout/Stack';
import {
  ComponentWithValueProps,
  TitledComponentProps,
} from '../../../../lib/ui/props';
import { Text } from '../../../../lib/ui/text';

export const TxOverviewAddress: React.FC<
  ComponentWithValueProps<string> & TitledComponentProps
> = ({ value, title }) => {
  return (
    <VStack gap={16}>
      <Text weight="600" size={20} color="contrast">
        {title}
      </Text>
      <Text family="mono" color="primary" size={14} weight="400">
        {value}
      </Text>
    </VStack>
  );
};
