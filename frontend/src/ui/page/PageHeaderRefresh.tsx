import { RefreshIcon } from '../../lib/ui/icons/RefreshIcon';
import { Spinner } from '../../lib/ui/loaders/Spinner';
import { ClickableComponentProps } from '../../lib/ui/props';
import { PageHeaderIconButton } from './PageHeaderIconButton';

type PageHeaderRefreshProps = ClickableComponentProps & {
  isPending?: boolean;
};

export const PageHeaderRefresh: React.FC<PageHeaderRefreshProps> = ({
  onClick,
  isPending,
}) => (
  <PageHeaderIconButton
    onClick={onClick}
    icon={isPending ? <Spinner /> : <RefreshIcon />}
  />
);
