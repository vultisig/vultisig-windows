import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DiscoveryService } from '../../../../wailsjs/go/mediator/Server';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { Endpoint } from '../../../services/Endpoint';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenPageHeader } from '../shared/KeygenPageHeader';
import { PendingKeygenMessage } from '../shared/PendingKeygenMessage';
import { useCurrentJoinKeygenMsg } from '../state/currentJoinKeygenMsg';
import { CurrentLocalPartyIdProvider } from '../state/currentLocalPartyId';
import { CurrentServerTypeProvider } from '../state/currentServerType';
import { CurrentServerUrlProvider } from '../state/currentServerUrl';
import { generateLocalPartyId } from '../utils/localPartyId';
import { JoinKeygenSession } from './JoinKeygenSession';

export const JoinKeygenPage = () => {
  const { t } = useTranslation();

  const localPartyId = useMemo(generateLocalPartyId, []);

  const keygenMsg = useCurrentJoinKeygenMsg();

  const { sessionId, useVultisigRelay, serviceName } = keygenMsg;

  const { data, isPending } = useQuery({
    queryKey: ['serverUrl', sessionId],
    queryFn: () => {
      if (useVultisigRelay) {
        return Endpoint.VULTISIG_RELAY;
      }

      return DiscoveryService(serviceName);
    },
  });

  return (
    <CurrentLocalPartyIdProvider value={localPartyId}>
      <VStack flexGrow>
        {data ? (
          <CurrentServerUrlProvider value={data}>
            <CurrentServerTypeProvider
              initialValue={useVultisigRelay ? 'relay' : 'local'}
            >
              <JoinKeygenSession />
            </CurrentServerTypeProvider>
          </CurrentServerUrlProvider>
        ) : (
          <>
            <KeygenPageHeader
              title={<PageHeaderTitle>{t('setup')}</PageHeaderTitle>}
            />
            <PageContent justifyContent="center" alignItems="center">
              {isPending ? (
                <PendingKeygenMessage>
                  {t('discovering_mediator')}
                </PendingKeygenMessage>
              ) : (
                <Text>{t('failed_to_discover_mediator')}</Text>
              )}
            </PageContent>
          </>
        )}
      </VStack>
    </CurrentLocalPartyIdProvider>
  );
};
