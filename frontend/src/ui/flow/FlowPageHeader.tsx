import {
  ComponentWithBackActionProps,
  TitledComponentProps,
} from '../../lib/ui/props';
import { PageHeader } from '../page/PageHeader';
import { PageHeaderBackButton } from '../page/PageHeaderBackButton';
import { PageHeaderTitle } from '../page/PageHeaderTitle';

export const FlowPageHeader: React.FC<
  TitledComponentProps & Partial<ComponentWithBackActionProps>
> = ({ title, onBack }) => (
  <PageHeader
    title={<PageHeaderTitle>{title}</PageHeaderTitle>}
    primaryControls={<PageHeaderBackButton onClick={onBack} />}
  />
);
