import { ChevronLeftIcon } from '../../../lib/ui/icons/ChevronLeftIcon';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';

export const UploadQrPageHeader = () => {
  const navigate = useNavigate();

  return (
    <PageHeader
      primaryControls={
        <PageHeaderIconButton
          icon={<ChevronLeftIcon />}
          onClick={() => navigate(-1)}
        />
      }
      title={<PageHeaderTitle>Keysign</PageHeaderTitle>}
    />
  );
};
