import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { MpcServerTypeProvider } from '@core/ui/mpc/state/mpcServerType'
import { MpcServerUrlProvider } from '@core/ui/mpc/state/mpcServerUrl'
import { MpcPendingMessage } from '@core/ui/mpc/status/MpcPendingMessage'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTranslation } from 'react-i18next'

import { useKeygenServerUrlQuery } from '../../keygen/server/queries/useKeygenServerUrlQuery'

export const KeysignServerUrlProvider = ({ children }: ChildrenProp) => {
  const {
    keysignMsg: { serviceName, useVultisigRelay },
  } = useCorePathState<'joinKeysign'>()

  const serverType = useVultisigRelay ? 'relay' : 'local'

  const { t } = useTranslation()

  const query = useKeygenServerUrlQuery({
    serverType,
    serviceName,
  })

  return (
    <MatchQuery
      value={query}
      success={value => (
        <MpcServerUrlProvider value={value}>
          <MpcServerTypeProvider initialValue={serverType}>
            {children}
          </MpcServerTypeProvider>
        </MpcServerUrlProvider>
      )}
      error={() => (
        <FullPageFlowErrorState message={t('failed_to_discover_mediator')} />
      )}
      pending={() => (
        <>
          <PageHeader
            title={<PageHeaderTitle>{t('join_keysign')}</PageHeaderTitle>}
            primaryControls={<PageHeaderBackButton />}
          />
          <PageContent justifyContent="center" alignItems="center">
            <MpcPendingMessage>{t('discovering_mediator')}</MpcPendingMessage>
          </PageContent>
        </>
      )}
    />
  )
}
