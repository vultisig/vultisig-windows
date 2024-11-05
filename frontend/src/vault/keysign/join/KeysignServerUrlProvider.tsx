import { useTranslation } from 'react-i18next';

import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { useAppPathState } from '../../../navigation/hooks/useAppPathState';
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { useServerUrlQuery } from '../../keygen/shared/queries/useServerUrlQuery';
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType';
import { CurrentServerUrlProvider } from '../../keygen/state/currentServerUrl';

export const KeysignServerUrlProvider = ({
  children,
}: ComponentWithChildrenProps) => {
  const {
    keysignMsg: { serviceName, useVultisigRelay, sessionId },
  } = useAppPathState<'joinKeysign'>();

  const serverType = useVultisigRelay ? 'relay' : 'local';

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
          <CurrentServerTypeProvider initialValue={serverType}>
            {children}
          </CurrentServerTypeProvider>
        </CurrentServerUrlProvider>
      )}
      error={() => (
        <FullPageFlowErrorState
          title={t('join_keysign')}
          message={t('failed_to_discover_mediator')}
        />
      )}
      pending={() => (
        <>
          <PageHeader
            title={<PageHeaderTitle>{t('join_keysign')}</PageHeaderTitle>}
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
