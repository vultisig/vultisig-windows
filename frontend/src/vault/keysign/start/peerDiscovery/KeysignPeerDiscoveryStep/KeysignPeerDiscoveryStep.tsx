import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../../../lib/ui/layout/Stack';
import { ComponentWithForwardActionProps } from '../../../../../lib/ui/props';
import { PageContent } from '../../../../../ui/page/PageContent';
import { PageHeader } from '../../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../../ui/page/PageHeaderTitle';
import { KeygenNetworkReminder } from '../../../../keygen/shared/KeygenNetworkReminder';
import { ManageServerType } from '../../../../keygen/shared/peerDiscovery/ManageServerType';
import { DownloadKeysignQrCode } from '../DownloadKeysignQrCode';
import { useIsPeerDiscoveryStepDisabled } from '../hooks/useIsPeerDiscoveryStepDisabled';
import { KeysignPeerDiscoveryQrCode } from '../KeysignPeerDiscoveryCode';
import { Content } from './KeysignPeerDiscoveryStep.styled';
import { KeysignPeersManager } from './KeysignPeersManager';

export const KeysignPeerDiscoveryStep = ({
  onForward,
}: ComponentWithForwardActionProps) => {
  const { t } = useTranslation();

  const isDisabled = useIsPeerDiscoveryStepDisabled();

  useEffect(() => {
    if (!isDisabled) {
      onForward();
    }
  }, [isDisabled, onForward]);

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('keysign')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<DownloadKeysignQrCode />}
      />
      <PageContent
        data-testid="KeysignPeerDiscoveryStep-PageContent"
        as="form"
        gap={40}
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
      >
        <Content>
          <KeysignPeerDiscoveryQrCode />
          <VStack gap={40} alignItems="center">
            <ManageServerType />
            <KeysignPeersManager />
            <KeygenNetworkReminder />
          </VStack>
        </Content>
        <Button type="submit" isDisabled={isDisabled}>
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
