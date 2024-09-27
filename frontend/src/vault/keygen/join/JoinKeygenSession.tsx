import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Text } from '../../../lib/ui/text';
import { joinSession } from '../../../services/Keygen/Keygen';
import { PageContent } from '../../../ui/page/PageContent';
import { KeygenPageHeader } from '../shared/KeygenPageHeader';
import { PendingKeygenMessage } from '../shared/PendingKeygenMessage';
import { useCurrentJoinKeygenMsg } from '../state/currentJoinKeygenMsg';
import { useCurrentLocalPartyId } from '../state/currentLocalPartyId';
import { useCurrentServerUrl } from '../state/currentServerUrl';
import { JoinKeygenProcess } from './JoinKeygenProcess';

export const JoinKeygenSession = () => {
  const { t } = useTranslation();

  const localPartyId = useCurrentLocalPartyId();

  const keygenMsg = useCurrentJoinKeygenMsg();

  const { sessionId } = keygenMsg;
  const [serverUrl] = useCurrentServerUrl();

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
      <KeygenPageHeader />
      <PageContent justifyContent="center" alignItems="center">
        {sessionQuery.isPending ? (
          <PendingKeygenMessage>{t('joining_keygen')}</PendingKeygenMessage>
        ) : (
          <Text>{t('failed_to_join_keygen')}</Text>
        )}
      </PageContent>
    </>
  );
};
