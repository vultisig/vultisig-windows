import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { AdvertiseMediator } from '../../../../../wailsjs/go/mediator/Server';
import { ComponentWithForwardActionProps } from '../../../../lib/ui/props';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { Text } from '../../../../lib/ui/text';
import { postSession } from '../../../../services/Keygen/Keygen';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { keygenServerUrl } from '../../../keygen/KeygenServerType';
import { PendingKeygenMessage } from '../../../keygen/shared/PendingKeygenMessage';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { useCurrentLocalPartyId } from '../../../keygen/state/currentLocalPartyId';
import { useCurrentServerType } from '../../../keygen/state/currentServerType';
import { useCurrentServiceName } from '../../../setup/state/currentServiceName';
import { DownloadKeysignQrCode } from './DownloadKeysignQrCode';
import { KeysignPeerDiscovery } from './KeysignPeerDiscovery';

export const KeysignPeerDiscoveryStep = ({
  onForward,
}: ComponentWithForwardActionProps) => {
  const { t } = useTranslation();
  const sessionId = useCurrentSessionId();
  const serviceName = useCurrentServiceName();
  const [serverType] = useCurrentServerType();

  const localPartyId = useCurrentLocalPartyId();

  const { mutate: setupSession, ...setupSessionStatus } = useMutation({
    mutationFn: async () => {
      if (serverType === 'local') {
        await AdvertiseMediator(serviceName);
      }

      return postSession(keygenServerUrl[serverType], sessionId, localPartyId);
    },
  });

  useEffect(() => setupSession(), [setupSession]);

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={<DownloadKeysignQrCode />}
      />
      <QueryDependant
        query={setupSessionStatus}
        success={() => <KeysignPeerDiscovery onForward={onForward} />}
        pending={() => (
          <PageContent justifyContent="center" alignItems="center">
            <PendingKeygenMessage>{t('session_init')}</PendingKeygenMessage>
          </PageContent>
        )}
        error={() => (
          <PageContent justifyContent="center" alignItems="center">
            <Text>{t('session_init_failed')}</Text>
          </PageContent>
        )}
      />
    </>
  );
};
