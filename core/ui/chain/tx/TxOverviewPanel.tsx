import { SeparatedByLine } from '@lib/ui/layout/SeparatedByLine'
import { Panel } from '@lib/ui/panel/Panel'
import { ChildrenProp } from '@lib/ui/props'

export const TxOverviewPanel: React.FC<ChildrenProp> = ({ children }) => (
  <Panel>
    <SeparatedByLine gap={12}>{children}</SeparatedByLine>
  </Panel>
)
