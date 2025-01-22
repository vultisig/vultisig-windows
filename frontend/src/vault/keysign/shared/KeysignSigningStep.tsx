import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { KeysignMessagePayload } from '../../../chain/keysign/KeysignMessagePayload';
import { CurrentTxHashProvider } from '../../../chain/state/currentTxHash';
import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { TxOverviewChainDataRow } from '../../../chain/tx/components/TxOverviewRow';
import { MatchRecordUnion } from '../../../lib/ui/base/MatchRecordUnion';
import { Button } from '../../../lib/ui/buttons/Button';
import { ProgressLine } from '../../../lib/ui/flow/ProgressLine';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { makeAppPath } from '../../../navigation';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeygenNetworkReminder } from '../../keygen/shared/KeygenNetworkReminder';
import { MatchKeygenSessionStatus } from '../../keygen/shared/MatchKeygenSessionStatus';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { KeysignCustomMessageInfo } from '../join/verify/KeysignCustomMessageInfo';
import { KeysignSigningState } from './KeysignSigningState';
import { KeysignTxOverview } from './KeysignTxOverview';
import { useKeysignMutation } from './mutations/useKeysignMutation';
import { WithProgressIndicator } from './WithProgressIndicator';

type KeysignSigningStepProps = {
  payload: KeysignMessagePayload;
} & Partial<ComponentWithBackActionProps>;

export const KeysignSigningStep = ({
  onBack,
  payload,
}: KeysignSigningStepProps) => {
  const { t } = useTranslation();

  const { mutate: startKeysign, ...mutationStatus } =
    useKeysignMutation(payload);

  useEffect(() => startKeysign(), [startKeysign]);

  return (
    <MatchQuery
      value={mutationStatus}
      success={value => (
        <>
          <PageHeader title={<PageHeaderTitle>{t('done')}</PageHeaderTitle>} />
          <PageContent>
            <WithProgressIndicator value={1}>
              <TxOverviewPanel>
                <MatchRecordUnion
                  value={payload}
                  handlers={{
                    keysign: payload => (
                      <CurrentTxHashProvider value={value}>
                        <KeysignTxOverview value={payload} />
                      </CurrentTxHashProvider>
                    ),
                    custom: payload => (
                      <>
                        <KeysignCustomMessageInfo value={payload} />
                        <TxOverviewChainDataRow>
                          <span>{t('signature')}</span>
                          <span>{value}</span>
                        </TxOverviewChainDataRow>
                      </>
                    ),
                  }}
                />
              </TxOverviewPanel>
            </WithProgressIndicator>
            <Link to={makeAppPath('vault')}>
              <Button as="div">{t('complete')}</Button>
            </Link>
          </PageContent>
        </>
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
