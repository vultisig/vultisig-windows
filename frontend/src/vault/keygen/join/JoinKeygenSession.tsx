import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { joinSession } from '../../../services/Keygen/Keygen';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { useCurrentJoinKeygenMsg } from '../state/currentJoinKeygenMsg';
import { useCurrentLocalPartyId } from '../state/currentLocalPartyId';
import { useCurrentServerUrl } from '../state/currentServerUrl';
import { JoinKeygenProcess } from './JoinKeygenProcess';

export const JoinKeygenSession = () => {
  const { t } = useTranslation();

  const localPartyId = useCurrentLocalPartyId();

  const keygenMsg = useCurrentJoinKeygenMsg();

  const { sessionId } = keygenMsg;
  const serverUrl = useCurrentServerUrl();

  const sessionQuery = useQuery({
    queryKey: ['keygenSession', sessionId],
    queryFn: () => {
      return joinSession(serverUrl, sessionId, localPartyId);
    },
  });

  if (sessionQuery.data) {
    return <JoinKeygenProcess />;
  }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('keygen')}</PageHeaderTitle>}
      />
      <VStack flexGrow justifyContent="center" alignItems="center">
        {sessionQuery.isPending ? (
          <Text>{t('joining_keygen')}</Text>
        ) : (
          <Text>{t('failed_to_join_keygen')}</Text>
        )}
      </VStack>
    </>
  );
};
