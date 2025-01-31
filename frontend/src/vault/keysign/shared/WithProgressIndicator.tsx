import { ProgressLine } from '../../../lib/ui/flow/ProgressLine';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ChildrenProp, ValueProp } from '../../../lib/ui/props';

export const WithProgressIndicator: React.FC<
  ValueProp<number> & ChildrenProp
> = ({ value, children }) => (
  <VStack flexGrow gap={28}>
    <ProgressLine value={value} />
    {children}
  </VStack>
);
