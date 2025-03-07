import { useTranslation } from 'react-i18next'

import { ChildrenProp } from '../../../lib/ui/props'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { MpcServerTypeProvider } from '../../../mpc/serverType/state/mpcServerType'
import { useAppPathState } from '../../../navigation/hooks/useAppPathState'
import { FullPageFlowErrorState } from '../../../ui/flow/FullPageFlowErrorState'
import { PageContent } from '../../../ui/page/PageContent'
import { PageHeader } from '../../../ui/page/PageHeader'
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle'
import { useKeygenServerUrlQuery } from '../../keygen/server/queries/useKeygenServerUrlQuery'
import { PendingKeygenMessage } from '../../keygen/shared/PendingKeygenMessage'
import { CurrentServerUrlProvider } from '../../keygen/state/currentServerUrl'

export const KeysignServerUrlProvider = ({ children }: ChildrenProp) => {
  const {
    keysignMsg: { serviceName, useVultisigRelay },
  } = useAppPathState<'joinKeysign'>()

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
        <CurrentServerUrlProvider value={value}>
          <MpcServerTypeProvider initialValue={serverType}>
            {children}
          </MpcServerTypeProvider>
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
  )
}
