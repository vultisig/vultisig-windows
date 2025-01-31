import { OnBackProp, TitleProp } from '../../lib/ui/props';
import { PageHeader } from '../page/PageHeader';
import { PageHeaderBackButton } from '../page/PageHeaderBackButton';
import { PageHeaderTitle } from '../page/PageHeaderTitle';

export const FlowPageHeader: React.FC<TitleProp & Partial<OnBackProp>> = ({
  title,
  onBack,
}) => (
  <PageHeader
    title={<PageHeaderTitle>{title}</PageHeaderTitle>}
    primaryControls={<PageHeaderBackButton onClick={onBack} />}
  />
);
