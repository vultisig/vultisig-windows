import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DiscoveryService } from '../../../../wailsjs/go/mediator/Server';
import { VStack } from '../../../lib/ui/layout/Stack';
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

  const serverUrlQuery = useQuery({
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
        {serverUrlQuery.data ? (
          <CurrentServerUrlProvider value={serverUrlQuery.data}>
            <JoinKeygenSession />
          </CurrentServerUrlProvider>
        ) : (
          <>
            <PageHeader
              secondaryControls={<PageHeaderBackButton />}
              title={<PageHeaderTitle>{t('setup')}</PageHeaderTitle>}
            />
            <VStack flexGrow justifyContent="center" alignItems="center">
              {/* TODO: refactor pending state styles */}
              {serverUrlQuery.isPending ? (
                <div className="text-center text-white">
                  <p className="text-2xl font-bold">
                    {t('discovering_mediator')}
                  </p>
                  <p className="text-2xl font-bold">{localPartyId}</p>
                  <img
                    src="/assets/icons/wifi.svg"
                    alt="wifi"
                    className="mx-auto mt-[30vh] mb-6"
                  />
                </div>
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
