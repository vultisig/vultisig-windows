import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { DynamicInfoPanel } from '../../../../../components/actionInfoCard/DynamicInfoPanel';
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
import { PeersManager } from '../../../../keygen/shared/PeersManager';
import { DownloadKeysignQrCode } from '../DownloadKeysignQrCode';
import { useIsPeerDiscoveryStepDisabled } from '../hooks/useIsPeerDiscoveryStepDisabled';
import { KeysignPeerDiscoveryQrCode } from '../KeysignPeerDiscoveryCode';
import { Content, Wrapper } from './KeysignPeerDiscoveryStep.styled';

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
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<DownloadKeysignQrCode />}
      />
      <PageContent
        as="form"
        gap={40}
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
      >
        <Wrapper>
          <Content>
            <KeysignPeerDiscoveryQrCode />
            <VStack gap={40} flexGrow alignItems="center">
              <ManageServerType />
              <PeersManager />
              <KeygenNetworkReminder />
            </VStack>
          </Content>
          <DynamicInfoPanel
            title="Join Keysign"
            subtitle="Scan with devices to participate in signing the transaction"
          />
        </Wrapper>
        <Button type="submit" isDisabled={isDisabled}>
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
