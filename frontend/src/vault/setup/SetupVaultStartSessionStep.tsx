import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../lib/ui/props';
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { Text } from '../../lib/ui/text';
import { startSession } from '../../services/Keygen/Keygen';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { PendingKeygenMessage } from '../keygen/shared/PendingKeygenMessage';
import { useCurrentServerUrl } from '../keygen/state/currentServerUrl';
import { useVaultKeygenDevices } from './hooks/useVaultKegenDevices';
import { useCurrentSessionId } from './state/currentSessionId';

export const SetupVaultStartSessionStep = ({
  onBack,
  onForward,
}: ComponentWithBackActionProps & ComponentWithForwardActionProps) => {
  const { t } = useTranslation();

  const sessionId = useCurrentSessionId();

  const serverUrl = useCurrentServerUrl();

  const devices = useVaultKeygenDevices();

  const { mutate: start, ...status } = useMutation({
    mutationFn: () => {
      return startSession(serverUrl, sessionId, devices);
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
      <PageContent justifyContent="center" alignItems="center">
        <QueryDependant
          query={status}
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
