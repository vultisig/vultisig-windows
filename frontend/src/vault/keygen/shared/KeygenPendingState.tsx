import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EventsOn } from '../../../../wailsjs/runtime/runtime';
import { VStack } from '../../../lib/ui/layout/Stack';
import { PageContent } from '../../../ui/page/PageContent';
import { KeygenEducation } from './KeygenEducation';
import { KeygenNetworkReminder } from './KeygenNetworkReminder';
import { KeygenProgressIndicator } from './KeygenProgressIndicator';
import { PendingKeygenMessage } from './PendingKeygenMessage';

export const KeygenPendingState = () => {
  const { t } = useTranslation();

  const [hasKeygenStarted, setHasKeygenStarted] = useState<boolean>(false);

  useEffect(() => {
    EventsOn('PrepareVault', () => setHasKeygenStarted(true));
  }, []);

  if (hasKeygenStarted) {
    return (
      <PageContent>
        <VStack flexGrow alignItems="center" justifyContent="center" gap={48}>
          <KeygenProgressIndicator />
          <KeygenEducation />
        </VStack>
        <KeygenNetworkReminder />
      </PageContent>
    );
  }

  return (
    <PageContent alignItems="center" justifyContent="center">
      <PendingKeygenMessage>
        {t('waiting_for_keygen_start')}
      </PendingKeygenMessage>
    </PageContent>
  );
};
