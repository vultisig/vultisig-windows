import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ProgressLine } from '../../../lib/ui/flow/ProgressLine';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenNetworkReminder } from '../../keygen/shared/KeygenNetworkReminder';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { useCurrentServerUrl } from '../../keygen/state/currentServerUrl';
import { joinSession } from '../../keygen/utils/joinSession';
import { useAssertCurrentVault } from '../../state/useCurrentVault';
import { KeysignErrorState } from '../shared/KeysignErrorState';
import { useCurrentJoinKeysignMsg } from './state/currentJoinKeysignMsg';

export const JoinKeysignSessionStep = ({
  onForward,
  onBack,
}: ComponentWithForwardActionProps & ComponentWithBackActionProps) => {
  const vault = useAssertCurrentVault();

  const { sessionId } = useCurrentJoinKeysignMsg();

  const serverUrl = useCurrentServerUrl();

  const { mutate: start, ...mutationStatus } = useMutation({
    mutationFn: async () => {
      return joinSession({
        serverUrl,
        sessionId,
        localPartyId: vault.local_party_id,
      });
    },
    onSuccess: onForward,
  });

  useEffect(() => start(), [start]);

  const { t } = useTranslation();

  return (
    <QueryDependant
      query={mutationStatus}
      success={() => null}
      error={() => <KeysignErrorState title={t('failed_to_join_session')} />}
      pending={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
            title={<PageHeaderTitle>{t('join_keysign')}</PageHeaderTitle>}
          />
          <PageContent>
            <VStack flexGrow>
              <ProgressLine value={0.7} />
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
