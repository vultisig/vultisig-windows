import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Match } from '../../../lib/ui/base/Match';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import { useNavigateBack } from '../../../navigation/hooks/useNavigationBack';
import { FlowPageHeader } from '../../../ui/flow/FlowPageHeader';
import { ScanQrView } from './ScanQrView';
import { UploadQrView } from './UploadQrView';

const uploadQrViews = ['scan', 'upload'] as const;
type UploadQrView = (typeof uploadQrViews)[number];

export const UploadQrPage = () => {
  const { t } = useTranslation();

  const [{ title = t('keysign') }] = useAppPathParams<'uploadQr'>();

  const goBack = useNavigateBack();

  const [view, setView] = useState<UploadQrView>('scan');

  const viewIndex = uploadQrViews.indexOf(view);

  return (
    <>
      <FlowPageHeader
        onBack={
          viewIndex === 0 ? goBack : () => setView(uploadQrViews[viewIndex - 1])
        }
        title={title}
      />
      <Match
        value={view}
        scan={() => (
          <ScanQrView onUploadQrViewRequest={() => setView('upload')} />
        )}
        upload={() => <UploadQrView />}
      />
    </>
  );
};
