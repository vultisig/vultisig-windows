import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { AdvertiseMediator } from '../../../../../wailsjs/go/mediator/Server';
import {
  ComponentWithBackActionProps,
  ComponentWithDisabledState,
  ComponentWithForwardActionProps,
  TitledComponentProps,
} from '../../../../lib/ui/props';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { Query } from '../../../../lib/ui/query/Query';
import { Text } from '../../../../lib/ui/text';
import { postSession } from '../../../../services/Keygen/Keygen';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { useCurrentLocalPartyId } from '../../state/currentLocalPartyId';
import { useCurrentServerType } from '../../state/currentServerType';
import { useCurrentServerUrl } from '../../state/currentServerUrl';
import { PendingKeygenMessage } from '../PendingKeygenMessage';
import { useCurrentServiceName } from '../state/currentServiceName';
import { useCurrentSessionId } from '../state/currentSessionId';
import { DownloadKeygenQrCode } from './DownloadKeygenQrCode';
import { KeygenPeerDiscovery } from './KeygenPeerDiscovery';

type KeygenPeerDiscoveryStepProps = ComponentWithForwardActionProps &
  Partial<ComponentWithBackActionProps> &
  TitledComponentProps &
  ComponentWithDisabledState & {
    joinUrlQuery: Query<string>;
  };

export const KeygenPeerDiscoveryStep = ({
  onForward,
  onBack,
  title,
  isDisabled,
  joinUrlQuery,
}: KeygenPeerDiscoveryStepProps) => {
  const { t } = useTranslation();
  const sessionId = useCurrentSessionId();
  const serviceName = useCurrentServiceName();
  const [serverType] = useCurrentServerType();

  const localPartyId = useCurrentLocalPartyId();

  const serverUrl = useCurrentServerUrl();

  const { mutate: setupSession, ...setupSessionStatus } = useMutation({
    mutationFn: async () => {
      if (serverType === 'local') {
        await AdvertiseMediator(serviceName);
      }

      return postSession(serverUrl, sessionId, localPartyId);
    },
  });

  useEffect(() => setupSession(), [setupSession]);

  return (
    <>
      <PageHeader
        title={<PageHeaderTitle>{title}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        secondaryControls={
          <QueryDependant
            query={joinUrlQuery}
            success={value => <DownloadKeygenQrCode value={value} />}
            error={() => null}
            pending={() => null}
          />
        }
      />
      <QueryDependant
        query={setupSessionStatus}
        success={() => (
          <KeygenPeerDiscovery
            joinUrlQuery={joinUrlQuery}
            isDisabled={isDisabled}
            onForward={onForward}
          />
        )}
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
