import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DiscoveryService } from '../../../../wailsjs/go/mediator/Server';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { Panel } from '../../../lib/ui/panel/Panel';
import { Text } from '../../../lib/ui/text';
import { Endpoint } from '../../../services/Endpoint';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { useCurrentJoinKeygenMsg } from '../state/currentJoinKeygenMsg';
import { CurrentLocalPartyIdProvider } from '../state/currentLocalPartyId';
import { CurrentServerUrlProvider } from '../state/currentServerUrl';
import { generateLocalPartyId } from '../utils/generateLocalPartyId';
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
            <JoinKeygenSession />
          </CurrentServerUrlProvider>
        ) : (
          <>
            <PageHeader
              primaryControls={<PageHeaderBackButton />}
              title={<PageHeaderTitle>{t('setup')}</PageHeaderTitle>}
            />
            <VStack flexGrow justifyContent="center" alignItems="center">
              {isPending ? (
                <Panel>
                  <VStack alignItems="center" gap={8}>
                    <Text size={24}>
                      <Spinner />
                    </Text>
                    <VStack alignItems="center" gap={20}>
                      <Text size={14} weight="700">
                        {t('this_device')} {localPartyId}
                      </Text>
                      <Text size={14} weight="700">
                        {t('discovering_mediator')}
                      </Text>
                    </VStack>
                  </VStack>
                </Panel>
              ) : (
                <Text>{t('failed_to_discover_mediator')}</Text>
              )}
            </VStack>
          </>
        )}
      </VStack>
    </CurrentLocalPartyIdProvider>
  );
};
