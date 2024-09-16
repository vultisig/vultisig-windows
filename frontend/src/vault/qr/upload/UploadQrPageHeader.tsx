import { useNavigate } from 'react-router-dom';

import { ChevronLeftIcon } from '../../../lib/ui/icons/ChevronLeftIcon';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';

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
