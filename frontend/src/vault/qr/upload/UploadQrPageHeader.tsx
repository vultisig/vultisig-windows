import { useTranslation } from 'react-i18next';

import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';

export const UploadQrPageHeader = () => {
  const { t } = useTranslation();

  const [{ title = t('keysign') }] = useAppPathParams<'uploadQr'>();

  return <FlowPageHeader title={title} />;
};
