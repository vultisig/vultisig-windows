import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AdvertiseMediator } from '../../../../wailsjs/go/mediator/Server';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { Text } from '../../../lib/ui/text';
import { postSession } from '../../../services/Keygen/Keygen';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { keygenServerUrl } from '../../keygen/KeygenServerType';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { useCurrentLocalPartyId } from '../../keygen/state/currentLocalPartyId';
import { useCurrentServerType } from '../../keygen/state/currentServerType';
import { generateServiceName } from '../../keygen/utils/generateServiceName';
import { useCurrentKeygenThreshold } from '../state/currentKeygenThreshold';
import { useCurrentSessionId } from '../state/currentSessionId';
import { DownloadKeygenQrCode } from './DownloadKeygenQrCode';
import { SetupVaultPeerDiscovery } from './SetupVaultPeerDiscovery';

export const SetupVaultPeerDiscoveryStep = ({
  onForward,
  onBack,
}: ComponentWithForwardActionProps & ComponentWithBackActionProps) => {
  const { t } = useTranslation();
  const sessionId = useCurrentSessionId();
  const [thresholdType] = useCurrentKeygenThreshold();
  const serviceName = useMemo(generateServiceName, []);
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
        title={
          <PageHeaderTitle>
            {t('keygen_for')} {thresholdType} {t('vault')}
          </PageHeaderTitle>
        }
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={<DownloadKeygenQrCode />}
      />
      <QueryDependant
        query={setupSessionStatus}
        success={() => <SetupVaultPeerDiscovery onForward={onForward} />}
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
