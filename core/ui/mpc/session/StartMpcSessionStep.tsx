import { MpcSession } from '@core/ui/mpc/session/MpcSession'
import { useStartMpcSession } from '@core/ui/mpc/session/useStartMpcSession'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../flow/FlowErrorPageContent'

type StartMpcSessionStepProps = OnFinishProp<string[]> &
  ValueProp<MpcSession> & {
    renderPending?: () => ReactNode
  }

export const StartMpcSessionStep = ({
  onFinish,
  value,
  renderPending,
}: StartMpcSessionStepProps) => {
  const { t } = useTranslation()
  const { mutate: start, ...status } = useStartMpcSession(onFinish)

  useEffect(() => start(), [start])

  return (
    <>
      <PageHeader title={t(value)} hasBorder />
      <MatchQuery
        value={status}
        pending={() =>
          renderPending ? (
            renderPending()
          ) : (
            <PageContent justifyContent="center" alignItems="center">
              <Spinner size="3em" />
            </PageContent>
          )
        }
        error={error => (
          <PageContent justifyContent="center" alignItems="center">
            <FlowErrorPageContent
              title={t('session_init_failed')}
              error={error}
            />
          </PageContent>
        )}
      />
    </>
  )
}
