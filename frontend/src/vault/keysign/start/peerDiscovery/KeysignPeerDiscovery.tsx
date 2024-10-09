import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Button } from '../../../../lib/ui/buttons/Button';
import { uniformColumnGrid } from '../../../../lib/ui/css/uniformColumnGrid';
import { getFormProps } from '../../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { ComponentWithForwardActionProps } from '../../../../lib/ui/props';
import { PageContent } from '../../../../ui/page/PageContent';
import { KeygenNetworkReminder } from '../../../keygen/shared/KeygenNetworkReminder';
import { PeersManager } from '../../../keygen/shared/PeersManager';
import { ManageServerType } from '../../../setup/peerDiscovery/ManageServerType';
import { useIsPeerDiscoveryStepDisabled } from './hooks/useIsPeerDiscoveryStepDisabled';
import { KeysignPeerDiscoveryQrCode } from './KeysignPeerDiscoveryCode';

const Content = styled.div`
  ${uniformColumnGrid({
    minChildrenWidth: 320,
    gap: 40,
    fullWidth: true,
  })}
  flex: 1;
  align-items: center;
`;

export const KeysignPeerDiscovery = ({
  onForward,
}: ComponentWithForwardActionProps) => {
  const { t } = useTranslation();

  const isDisabled = useIsPeerDiscoveryStepDisabled();

  return (
    <PageContent
      as="form"
      gap={40}
      {...getFormProps({
        onSubmit: onForward,
        isDisabled,
      })}
    >
      <Content>
        <KeysignPeerDiscoveryQrCode />
        <VStack gap={40} flexGrow alignItems="center">
          <ManageServerType />
          <PeersManager />

          <KeygenNetworkReminder />
        </VStack>
      </Content>
      <Button type="submit" isDisabled={isDisabled}>
        {t('continue')}
      </Button>
    </PageContent>
  );
};
