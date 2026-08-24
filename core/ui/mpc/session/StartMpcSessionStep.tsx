import { KeygenConnectingAnimation } from '@core/ui/mpc/keygen/progress/KeygenConnectingAnimation'
import { MpcSession } from '@core/ui/mpc/session/MpcSession'
import { useStartMpcSession } from '@core/ui/mpc/session/useStartMpcSession'
import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { ReactNode, useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../flow/FlowErrorPageContent'

export const StartMpcSessionStep = ({
  onFinish,
  onError,
  renderPending,
  value,
  securityType,
}: OnFinishProp<string[]> &
  ValueProp<MpcSession> & {
    onError?: () => void
    renderPending?: () => ReactNode
    securityType?: VaultSecurityType
  }) => {
  const { t } = useTranslation()
  const { mutate: start, ...status } = useStartMpcSession(onFinish)

  useEffect(() => start(), [start])
  useLayoutEffect(() => {
    if (status.isError) onError?.()
  }, [onError, status.isError])

  return (
    <>
      {!renderPending || status.isError ? (
        <PageHeader title={t(value)} hasBorder />
      ) : null}
      <MatchQuery
        value={status}
        pending={() =>
          renderPending ? (
            renderPending()
          ) : (
            <KeygenConnectingAnimation securityType={securityType} />
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
