import { ChildrenProp, ValueProp } from '@lib/ui/props'

import { ProgressLine } from '../../../lib/ui/flow/ProgressLine'
import { VStack } from '../../../lib/ui/layout/Stack'

export const WithProgressIndicator: React.FC<
  ValueProp<number> & ChildrenProp
> = ({ value, children }) => (
  <VStack flexGrow gap={28}>
    <ProgressLine value={value} />
    {children}
  </VStack>
)
