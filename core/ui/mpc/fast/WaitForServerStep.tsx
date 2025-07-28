import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const WaitForServerStep: FC<OnFinishProp<string[]>> = ({ onFinish }) => {
  const { t } = useTranslation()
  const peersQuery = useMpcPeerOptionsQuery()

  useEffect(() => {
    if (peersQuery.data) onFinish(peersQuery.data)
  }, [onFinish, peersQuery.data])

  return (
    <>
      <PageHeader title={t('connecting_to_server')} hasBorder />
      <MatchQuery
        value={peersQuery}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_connect_with_server')}
            error={error}
          />
        )}
        pending={() => (
          <FlowPendingPageContent
            title={`${t('connecting_to_server')}...`}
            message={t('fastVaultSetup.takeMinute')}
          />
        )}
      />
    </>
  )
}
