import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { CurrentTxHashProvider } from '../../../chain/state/currentTxHash';
import { ProgressLine } from '../../../lib/ui/flow/ProgressLine';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenNetworkReminder } from '../../keygen/shared/KeygenNetworkReminder';
import { MatchKeygenSessionStatus } from '../../keygen/shared/MatchKeygenSessionStatus';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { KeysignSigningState } from './KeysignSigningState';
import { KeysignSummaryStep } from './KeysignSummaryStep';
import { useKeysignMutation } from './mutations/useKeysignMutation';

export const KeysignSigningStep = ({
  onBack,
}: Partial<ComponentWithBackActionProps>) => {
  const { t } = useTranslation();

  const { mutate: startKeysign, ...mutationStatus } = useKeysignMutation();

  useEffect(() => startKeysign(), [startKeysign]);

  return (
    <MatchQuery
      value={mutationStatus}
      success={txHash => (
        <CurrentTxHashProvider value={txHash}>
          <KeysignSummaryStep />
        </CurrentTxHashProvider>
      )}
      error={error => (
        <FullPageFlowErrorState
          title={t('keysign')}
          message={t('signing_error')}
          errorMessage={extractErrorMsg(error)}
        />
      )}
      pending={() => (
        <>
          <PageHeader
            primaryControls={<PageHeaderBackButton onClick={onBack} />}
            title={<PageHeaderTitle>{t('keysign')}</PageHeaderTitle>}
          />
          <PageContent data-testid="KeysignVerifyStep-PageContent">
            <VStack flexGrow>
              <MatchKeygenSessionStatus
                pending={() => (
                  <>
                    <ProgressLine value={0.75} />
                    <VStack
                      flexGrow
                      alignItems="center"
                      justifyContent="center"
                    >
                      <PendingKeygenMessage>
                        {t('waiting_for_keysign_start')}
                      </PendingKeygenMessage>
                    </VStack>
                  </>
                )}
                active={value => <KeysignSigningState value={value} />}
              />
            </VStack>
            <KeygenNetworkReminder />
          </PageContent>
        </>
      )}
    />
  );
};
