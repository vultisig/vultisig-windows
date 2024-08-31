import { useNavigate } from 'react-router-dom';
import { PageHeaderIconButton } from './PageHeaderIconButton';
import { ChevronLeftIcon } from '../../lib/ui/icons/ChevronLeftIcon';

export const PageHeaderBackButton = () => {
  const navigate = useNavigate();

  return (
    <PageHeaderIconButton
      icon={<ChevronLeftIcon />}
      onClick={() => navigate(-1)}
    />
  );
};
