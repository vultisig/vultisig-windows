import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { match } from '@lib/utils/match';
import { PageContent } from '../../../ui/page/PageContent';
import { KeygenType } from '../KeygenType';
import { useCurrentKeygenType } from '../state/currentKeygenType';
import { KeygenEducation } from './KeygenEducation';
import { KeygenNetworkReminder } from './KeygenNetworkReminder';
import { KeygenProgressIndicator } from './KeygenProgressIndicator';
import { MatchKeygenSessionStatus } from './MatchKeygenSessionStatus';
import { PendingKeygenMessage } from './PendingKeygenMessage';

export const KeygenPendingState = () => {
  const { t } = useTranslation();

  const keygenType = useCurrentKeygenType();

  const message = match(keygenType, {
    [KeygenType.Keygen]: () => t('waiting_for_keygen_start'),
    [KeygenType.Reshare]: () => t('waiting_for_reshare_start'),
  });

  return (
    <MatchKeygenSessionStatus
      pending={() => (
        <PageContent alignItems="center" justifyContent="center">
          <PendingKeygenMessage>{message}</PendingKeygenMessage>
        </PageContent>
      )}
      active={value => (
        <PageContent>
          <VStack flexGrow alignItems="center" justifyContent="center" gap={48}>
            <KeygenProgressIndicator value={value} />
            <KeygenEducation />
          </VStack>
          <KeygenNetworkReminder />
        </PageContent>
      )}
    />
  );
};
