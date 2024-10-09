import { ProgressLine } from '../../../lib/ui/flow/ProgressLine';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithChildrenProps,
  ComponentWithValueProps,
} from '../../../lib/ui/props';

export const WithProgressIndicator: React.FC<
  ComponentWithValueProps<number> & ComponentWithChildrenProps
> = ({ value, children }) => (
  <VStack flexGrow gap={28}>
    <ProgressLine value={value} />
    {children}
  </VStack>
);
