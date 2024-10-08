import { useNavigate } from 'react-router-dom';

import { ChevronLeftIcon } from '../../lib/ui/icons/ChevronLeftIcon';
import { ClickableComponentProps } from '../../lib/ui/props';
import { PageHeaderIconButton } from './PageHeaderIconButton';

export const PageHeaderBackButton = ({
  onClick,
}: Partial<ClickableComponentProps>) => {
  const navigate = useNavigate();

  return (
    <PageHeaderIconButton
      icon={<ChevronLeftIcon />}
      onClick={onClick ?? (() => navigate(-1))}
    />
  );
};
