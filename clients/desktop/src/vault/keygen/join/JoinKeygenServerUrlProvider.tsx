import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { MpcServerUrlProvider } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcServiceName } from '@core/ui/mpc/state/mpcServiceName'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { useKeygenServerUrlQuery } from '../server/queries/useKeygenServerUrlQuery'
import { PendingKeygenMessage } from '@core/ui/mpc/status/PendingKeygenMessage'

export const JoinKeygenServerUrlProvider = ({ children }: ChildrenProp) => {
  const [serverType] = useMpcServerType()
  const [serviceName] = useMpcServiceName()

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
