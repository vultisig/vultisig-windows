import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { useMpcServerType } from '../../../mpc/serverType/state/mpcServerType'
import { MpcServerUrlProvider } from '../../../mpc/serverType/state/mpcServerUrl'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage'
import { useKeygenServerUrlQuery } from '../server/queries/useKeygenServerUrlQuery'
import { useCurrentServiceName } from '../shared/state/currentServiceName'

export const KeygenServerUrlProvider = ({ children }: ChildrenProp) => {
  const [serverType] = useMpcServerType()
  const [serviceName] = useCurrentServiceName()

  const { t } = useTranslation()

  const query = useKeygenServerUrlQuery({
    serverType,
    serviceName,
  })

  return (
    <MatchQuery
      value={query}
      success={value => (
        <MpcServerUrlProvider value={value}>{children}</MpcServerUrlProvider>
      )}
      error={() => (
        <FullPageFlowErrorState message={t('failed_to_discover_mediator')} />
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
  )
}
