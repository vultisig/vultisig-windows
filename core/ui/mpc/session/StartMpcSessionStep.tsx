import { MpcSession } from '@core/ui/mpc/session/MpcSession'
import { useStartMpcSession } from '@core/ui/mpc/session/useStartMpcSession'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../flow/FlowErrorPageContent'

export const StartMpcSessionStep = ({
  onFinish,
  value,
}: OnFinishProp<string[]> & ValueProp<MpcSession>) => {
  const { t } = useTranslation()
  const { mutate: start, ...status } = useStartMpcSession(onFinish)

  useEffect(() => start(), [start])

  return (
    <>
      <PageHeader title={t(value)} hasBorder />
      <PageContent justifyContent="center" alignItems="center">
        <MatchQuery
          value={status}
          pending={() => <Spinner size="3em" />}
          error={error => (
            <FlowErrorPageContent
              title={t('session_init_failed')}
              error={error}
            />
          )}
        />
      </PageContent>
    </>
  )
}
