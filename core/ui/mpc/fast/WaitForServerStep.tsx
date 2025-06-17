import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
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
            message={extractErrorMsg(error)}
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
