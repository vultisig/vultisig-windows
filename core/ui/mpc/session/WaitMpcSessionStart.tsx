import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { FullPageFlowErrorState } from '@core/ui/flow/FullPageFlowErrorState'
import { MpcPendingMessage } from '@core/ui/mpc/status/MpcPendingMessage'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useMpcSignersQuery } from '../devices/queries/queries/useMpcSignersQuery'
import { MpcSession } from './MpcSession'

export const WaitMpcSessionStart = ({
  onFinish,
  value,
}: OnFinishProp<string[]> & ValueProp<MpcSession>) => {
  const signersQuery = useMpcSignersQuery()

  useEffect(() => {
    if (signersQuery.data) {
      onFinish(signersQuery.data)
    }
  }, [onFinish, signersQuery.data])

  const { t } = useTranslation()

  const title = t(`join_${value}`)

  return (
    <MatchQuery
      error={error => (
        <FullPageFlowErrorState
          title={t(`failed_to_join_${value}`)}
          error={error}
        />
      )}
      value={signersQuery}
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
