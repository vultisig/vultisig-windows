import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { useCurrentLocalPartyId } from '../state/currentLocalPartyId';
import { useCurrentServerUrl } from '../state/currentServerUrl';
import { joinSession } from '../utils/joinSession';
import { KeygenNetworkReminder } from './KeygenNetworkReminder';
import { PendingKeygenMessage } from './PendingKeygenMessage';
import { useCurrentSessionId } from './state/currentSessionId';

export const JoinKeygenSessionStep = ({
  onForward,
  onBack,
}: ComponentWithForwardActionProps & Partial<ComponentWithBackActionProps>) => {
  const sessionId = useCurrentSessionId();

  const serverUrl = useCurrentServerUrl();

  const localPartyId = useCurrentLocalPartyId();

  const { mutate: start, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      return joinSession({
        serverUrl,
        sessionId,
        localPartyId,
      });
    },
    onSuccess: onForward,
  });

  useEffect(() => start(), [start]);

  const { t } = useTranslation();

  const title = t('join_session');

  return (
    <MatchQuery
      value={mutationStatus}
      success={() => null}
      error={() => (
        <FullPageFlowErrorState
          title={title}
          message={t('failed_to_join_session')}
        />
      )}
      pending={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
            title={<PageHeaderTitle>{title}</PageHeaderTitle>}
          />
          <PageContent data-testid="JoinKeygenStep-PageContent">
            <VStack flexGrow>
              <VStack flexGrow alignItems="center" justifyContent="center">
                <PendingKeygenMessage>
                  {t('joining_session')}
                </PendingKeygenMessage>
              </VStack>
            </VStack>
            <KeygenNetworkReminder />
          </PageContent>
        </>
      )}
    />
  );
};
