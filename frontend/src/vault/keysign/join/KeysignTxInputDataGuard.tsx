import { useTranslation } from 'react-i18next';

import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { extractErrorMsg } from '../../../lib/utils/error/extractErrorMsg';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { KeysignTxInputDataProvider } from '../shared/state/keysignTxInputData';
import { useKeysignTxInputDataQuery } from './queries/useKeysignTxInputDataQuery';

export const KeysignTxInputDataGuard = ({
  children,
}: ComponentWithChildrenProps) => {
  const { t } = useTranslation();

  const query = useKeysignTxInputDataQuery();

  return (
    <MatchQuery
      value={query}
      error={error => (
        <FullPageFlowErrorState
          title={t('keysign')}
          message={t('read_msg_failed')}
          errorMessage={extractErrorMsg(error)}
        />
      )}
      pending={() => (
        <>
          <PageHeader
            title={<PageHeaderTitle>{t('keysign')}</PageHeaderTitle>}
            primaryControls={<PageHeaderBackButton />}
          />
          <PageContent justifyContent="center" alignItems="center">
            <PendingKeygenMessage>{t('read_msg')}</PendingKeygenMessage>
          </PageContent>
        </>
      )}
      success={value => (
        <KeysignTxInputDataProvider value={value}>
          {children}
        </KeysignTxInputDataProvider>
      )}
    />
  );
};
