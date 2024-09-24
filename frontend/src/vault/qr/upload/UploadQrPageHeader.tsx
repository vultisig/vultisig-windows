import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ChevronLeftIcon } from '../../../lib/ui/icons/ChevronLeftIcon';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderIconButton } from '../../../ui/page/PageHeaderIconButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';

export const UploadQrPageHeader = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { title = t('keysign') } = useAppPathParams<'uploadQr'>();

  return (
    <PageHeader
      primaryControls={
        <PageHeaderIconButton
          icon={<ChevronLeftIcon />}
          onClick={() => navigate(-1)}
        />
      }
      title={<PageHeaderTitle>{title}</PageHeaderTitle>}
    />
  );
};
