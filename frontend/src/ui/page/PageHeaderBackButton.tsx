import { useNavigate } from 'react-router-dom';

import { ChevronLeftIcon } from '../../lib/ui/icons/ChevronLeftIcon';
import { PageHeaderIconButton } from './PageHeaderIconButton';

type PageHeaderBackButtonProps = {
  onClick?: () => void;
};

export const PageHeaderBackButton = ({
  onClick,
}: PageHeaderBackButtonProps) => {
  const navigate = useNavigate();

  return (
    <PageHeaderIconButton
      icon={<ChevronLeftIcon />}
      onClick={onClick ? () => onClick() : () => navigate(-1)}
    />
  );
};
