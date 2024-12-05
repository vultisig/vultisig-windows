import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithChildrenProps,
  TitledComponentProps,
} from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';

export const TxOverviewPrimaryRow: React.FC<
  ComponentWithChildrenProps & TitledComponentProps
> = ({ children, title }) => {
  return (
    <VStack gap={16}>
      <Text weight="600" size={20} color="contrast">
        {title}
      </Text>
      <Text family="mono" color="primary" size={14} weight="400">
        {children}
      </Text>
    </VStack>
  );
};
