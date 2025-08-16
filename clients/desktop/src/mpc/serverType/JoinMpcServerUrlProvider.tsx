import { MpcMediatorManager } from '@clients/desktop/src/mpc/serverType/MpcMediatorManager'
import { useMpcServerUrlQuery } from '@clients/desktop/src/vault/keygen/server/queries/useMpcServerUrlQuery'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { MpcSession } from '@core/ui/mpc/session/MpcSession'
import { useMpcServerType } from '@core/ui/mpc/state/mpcServerType'
import { MpcServerUrlProvider } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcServiceName } from '@core/ui/mpc/state/mpcServiceName'
import { MpcPendingMessage } from '@core/ui/mpc/status/MpcPendingMessage'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

type JoinMpcServerUrlProviderInput = ChildrenProp & {
  mpcSession: MpcSession
}

export const JoinMpcServerUrlProvider = ({
  children,
  mpcSession,
}: JoinMpcServerUrlProviderInput) => {
  const { t } = useTranslation()
  const [serverType] = useMpcServerType()
  const [serviceName] = useMpcServiceName()

  const query = useMpcServerUrlQuery({
    serverType,
    serviceName,
  })

  return (
    <MatchQuery
      value={query}
      success={value => (
        <MpcServerUrlProvider value={value}>
          <MpcMediatorManager />
          {children}
        </MpcServerUrlProvider>
      )}
      error={error => (
        <FullPageFlowErrorState
          title={t('failed_to_discover_mediator')}
          error={error}
        />
      )}
      pending={() => (
        <>
          <PageHeader
            title={t(`join_${mpcSession}`)}
            primaryControls={<PageHeaderBackButton />}
            hasBorder
          />
          <PageContent alignItems="center" justifyContent="center">
            <MpcPendingMessage>{t('discovering_mediator')}</MpcPendingMessage>
          </PageContent>
        </>
      )}
    />
  )
}
