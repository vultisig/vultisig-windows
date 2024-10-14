import { useTranslation } from 'react-i18next';

import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { useServerUrlQuery } from '../../keygen/shared/queries/useServerUrlQuery';
import { useCurrentServerType } from '../../keygen/state/currentServerType';
import { CurrentServerUrlProvider } from '../../keygen/state/currentServerUrl';
import { useCurrentServiceName } from '../../setup/state/currentServiceName';
import { useCurrentSessionId } from '../shared/state/currentSessionId';

export const KeygenServerUrlProvider = ({
  children,
}: ComponentWithChildrenProps) => {
  const [sessionId] = useCurrentSessionId();

  const [serverType] = useCurrentServerType();
  const [serviceName] = useCurrentServiceName();

  const { t } = useTranslation();

  const query = useServerUrlQuery({
    serverType,
    serviceName,
    sessionId,
  });

  return (
    <QueryDependant
      query={query}
      success={value => (
        <CurrentServerUrlProvider value={value}>
          {children}
        </CurrentServerUrlProvider>
      )}
      error={() => (
        <FullPageFlowErrorState
          title={t('join_keygen')}
          message={t('failed_to_discover_mediator')}
        />
      )}
      pending={() => (
        <>
          <PageHeader
            title={<PageHeaderTitle>{t('join_keygen')}</PageHeaderTitle>}
            primaryControls={<PageHeaderBackButton />}
          />
          <PageContent justifyContent="center" alignItems="center">
            <PendingKeygenMessage>
              {t('discovering_mediator')}
            </PendingKeygenMessage>
          </PageContent>
        </>
      )}
    />
  );
};
