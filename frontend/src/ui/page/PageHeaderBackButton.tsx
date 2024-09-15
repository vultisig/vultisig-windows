import { useNavigate } from 'react-router-dom';

import { ChevronLeftIcon } from '../../lib/ui/icons/ChevronLeftIcon';
import { PageHeaderIconButton } from './PageHeaderIconButton';

export const PageHeaderBackButton = () => {
  const navigate = useNavigate();

  return (
    <PageHeaderIconButton
      icon={<ChevronLeftIcon />}
      onClick={() => navigate(-1)}
    />
  );
};
