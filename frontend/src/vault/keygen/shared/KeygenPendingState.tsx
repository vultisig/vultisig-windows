import { useTranslation } from 'react-i18next';

import { VStack } from '../../../lib/ui/layout/Stack';
import { PageContent } from '../../../ui/page/PageContent';
import { KeygenEducation } from './KeygenEducation';
import { KeygenNetworkReminder } from './KeygenNetworkReminder';
import { KeygenProgressIndicator } from './KeygenProgressIndicator';
import { MatchKeygenSessionStatus } from './MatchKeygenSessionStatus';
import { PendingKeygenMessage } from './PendingKeygenMessage';

export const KeygenPendingState = () => {
  const { t } = useTranslation();

  return (
    <MatchKeygenSessionStatus
      pending={() => (
        <PageContent alignItems="center" justifyContent="center">
          <PendingKeygenMessage>
            {t('waiting_for_keygen_start')}
          </PendingKeygenMessage>
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
