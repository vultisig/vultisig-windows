import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import JoinKeygenView from '../../../pages/keygen/JoinKeygenView';
import { joinSession } from '../../../services/Keygen/Keygen';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { keygenMsgRecord } from '../KeygenType';
import { useCurrentServerUrl } from '../state/currentServerUrl';
import { generateLocalPartyId } from '../utils/generateLocalPartyId';

export const JoinKeygenSession = () => {
  const { keygenType, keygenMsg: rawKeygenMsg } =
    useAppPathParams<'joinKeygen'>();

  const { t } = useTranslation();

  const localPartyId = useMemo(generateLocalPartyId, []);

  const keygenMsg = useMemo(() => {
    const { fromJsonString } = keygenMsgRecord[keygenType];

    return fromJsonString(rawKeygenMsg);
  }, [keygenType, rawKeygenMsg]);

  const { sessionId } = keygenMsg;
  const serverUrl = useCurrentServerUrl();

  const sessionQuery = useQuery({
    queryKey: ['keygenSession', sessionId],
    queryFn: () => {
      return joinSession(serverUrl, sessionId, localPartyId);
    },
  });

  if (sessionQuery.data) {
    return <JoinKeygenView />;
  }

  return (
    <>
      <PageHeader
        secondaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('keygen')}</PageHeaderTitle>}
      />
      <VStack flexGrow alignItems="center">
        {sessionQuery.isPending ? (
          <Text>{t('joining_keygen')}</Text>
        ) : (
          <Text>{t('failed_to_join_keygen')}</Text>
        )}
      </VStack>
    </>
  );
};
