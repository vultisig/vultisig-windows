import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { OnBackProp, OnForwardProp } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { Text } from '../../../lib/ui/text';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { useVaultKeygenDevices } from '../../setup/hooks/useVaultKegenDevices';
import { useCurrentServerUrl } from '../state/currentServerUrl';
import { startSession } from '../utils/startSession';
import { PendingKeygenMessage } from './PendingKeygenMessage';
import { useCurrentSessionId } from './state/currentSessionId';

export const KeygenStartSessionStep = ({
  onBack,
  onForward,
}: Partial<OnBackProp> & OnForwardProp) => {
  const { t } = useTranslation();

  const sessionId = useCurrentSessionId();
  const serverUrl = useCurrentServerUrl();
  const devices = useVaultKeygenDevices();

  const { mutate: start, ...status } = useMutation({
    mutationFn: () => {
      return startSession({ serverUrl, sessionId, devices });
    },
    onSuccess: () => onForward(),
  });

  useEffect(() => start(), [start]);

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('keygen')}</PageHeaderTitle>}
      />
      <PageContent
        justifyContent="center"
        alignItems="center"
        data-testid="KeygenStartStep-PageContent"
      >
        <MatchQuery
          value={status}
          pending={() => (
            <PendingKeygenMessage>{t('starting_keygen')}</PendingKeygenMessage>
          )}
          error={() => <Text>{t('failed_to_start_keygen')}</Text>}
          success={() => null}
        />
      </PageContent>
    </>
  );
};
