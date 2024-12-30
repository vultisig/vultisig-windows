import { ChevronLeftIcon } from '../../lib/ui/icons/ChevronLeftIcon';
import { ClickableComponentProps } from '../../lib/ui/props';
import { useNavigateBack } from '../../navigation/hooks/useNavigationBack';
import { PageHeaderIconButton } from './PageHeaderIconButton';

export const PageHeaderBackButton = ({
  onClick,
}: Partial<ClickableComponentProps>) => {
  const goBack = useNavigateBack();

  return (
    <PageHeaderIconButton
      icon={<ChevronLeftIcon />}
      onClick={onClick ?? goBack}
    />
  );
};
