import { Panel } from '@lib/ui/panel/Panel'
import { ChildrenProp } from '@lib/ui/props'

import { SeparatedByLine } from '../../../lib/ui/layout/SeparatedByLine'

export const TxOverviewPanel: React.FC<ChildrenProp> = ({ children }) => (
  <Panel>
    <SeparatedByLine gap={12}>{children}</SeparatedByLine>
  </Panel>
)
