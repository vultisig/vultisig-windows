import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { useMpcPeerOptionsQuery } from '@core/ui/mpc/devices/queries/useMpcPeerOptionsQuery'
import { KeygenConnectingAnimation } from '@core/ui/mpc/keygen/progress/KeygenConnectingAnimation'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FC, ReactNode, useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'

type WaitForServerStepProps = OnFinishProp<string[]> & {
  onError?: () => void
  onErrorChange?: (isError: boolean) => void
  renderPending?: () => ReactNode
}

export const WaitForServerStep: FC<WaitForServerStepProps> = ({
  onError,
  onErrorChange,
  onFinish,
  renderPending,
}) => {
  const { t } = useTranslation()
  const peersQuery = useMpcPeerOptionsQuery()

  useEffect(() => {
    if (peersQuery.data) onFinish(peersQuery.data)
  }, [onFinish, peersQuery.data])
  useLayoutEffect(() => {
    onErrorChange?.(peersQuery.isError)
    if (peersQuery.isError) onError?.()
  }, [onError, onErrorChange, peersQuery.isError])

  return (
    <>
      {!renderPending || peersQuery.isError ? (
        <PageHeader title={t('connecting_to_server')} hasBorder />
      ) : null}
      <MatchQuery
        value={peersQuery}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_connect_with_server')}
            error={error}
          />
        )}
        pending={() =>
          renderPending ? (
            renderPending()
          ) : (
            <KeygenConnectingAnimation securityType="fast" />
          )
        }
      />
    </>
  )
}
