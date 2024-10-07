import { SeparatedByLine } from '../../../lib/ui/layout/SeparatedByLine';
import { Panel } from '../../../lib/ui/panel/Panel';
import { ComponentWithChildrenProps } from '../../../lib/ui/props';

export const TxOverviewPanel: React.FC<ComponentWithChildrenProps> = ({
  children,
}) => (
  <Panel>
    <SeparatedByLine gap={12}>{children}</SeparatedByLine>
  </Panel>
);
