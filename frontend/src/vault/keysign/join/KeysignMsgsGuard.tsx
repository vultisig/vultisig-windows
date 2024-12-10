import { useTranslation } from 'react-i18next';

import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { CurrentKeysignMsgsProvider } from '../shared/state/currentKeysignMsgs';
import { useKeysignMsgsQuery } from './queries/useKeysignMsgsQuery';

export const KeysignMsgsGuard = ({ children }: ComponentWithChildrenProps) => {
  const { t } = useTranslation();

  const query = useKeysignMsgsQuery();

  return (
    <QueryDependant
      query={query}
      error={() => (
        <FullPageFlowErrorState
          title={t('keysign')}
          message={t('read_msg_failed')}
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
        <CurrentKeysignMsgsProvider value={value}>
          {children}
        </CurrentKeysignMsgsProvider>
      )}
    />
  );
};
