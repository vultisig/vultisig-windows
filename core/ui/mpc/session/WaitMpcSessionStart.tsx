import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { useMpcPeersQuery } from '@core/ui/mpc/devices/peers/queries/useMpcPeersQuery'
import { MpcPendingMessage } from '@core/ui/mpc/status/MpcPendingMessage'
import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { MpcSession } from './MpcSession'

export const WaitMpcSessionStart = ({
  onFinish,
  value,
}: OnFinishProp<string[]> & ValueProp<MpcSession>) => {
  const peersQuery = useMpcPeersQuery()

  useEffect(() => {
    const peers = peersQuery.data

    if (peers) {
      onFinish(peers)
    }
  }, [onFinish, peersQuery.data])

  const { t } = useTranslation()

  const title = t(`join_${value}`)

  return (
    <MatchQuery
      error={error => (
        <FullPageFlowErrorState
          message={t(`failed_to_join_${value}`)}
          errorMessage={extractErrorMsg(error)}
        />
      )}
      value={peersQuery}
      pending={() => (
        <>
          <FlowPageHeader title={title} />
          <PageContent alignItems="center" justifyContent="center">
            <MpcPendingMessage>
              {t(`waiting_for_${value}_start`)}
            </MpcPendingMessage>
          </PageContent>
        </>
      )}
    />
  )
}
