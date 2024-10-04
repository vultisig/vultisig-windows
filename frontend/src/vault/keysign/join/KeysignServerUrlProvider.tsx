import { useTranslation } from 'react-i18next';

import { ComponentWithChildrenProps } from '../../../lib/ui/props';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage';
import { useServerUrlQuery } from '../../keygen/shared/queries/useServerUrlQuery';
import { CurrentServerTypeProvider } from '../../keygen/state/currentServerType';
import { CurrentServerUrlProvider } from '../../keygen/state/currentServerUrl';
import { KeysignErrorState } from '../shared/KeysignErrorState';
import { useCurrentJoinKeysignMsg } from './state/currentJoinKeysignMsg';

export const KeysignServerUrlProvider = ({
  children,
}: ComponentWithChildrenProps) => {
  const { serviceName, useVultisigRelay, sessionId } =
    useCurrentJoinKeysignMsg();

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
        <KeysignErrorState title={t('failed_to_discover_mediator')} />
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
