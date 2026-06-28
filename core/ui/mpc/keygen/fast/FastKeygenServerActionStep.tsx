import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { useFastKeygenServerActionMutation } from '@core/ui/mpc/keygen/fast/mutations/useFastKeygenServerActionMutation'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { FC, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useKeygenOperation } from '../state/currentKeygenOperationType'

export const FastKeygenServerActionStep: FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()
  const { mutate, ...mutationState } = useFastKeygenServerActionMutation({
    onSuccess: onFinish,
  })
  const hasStartedRef = useRef(false)
  const keygenOperation = useKeygenOperation()

  const isPluginReshare = useMemo(() => {
    return 'reshare' in keygenOperation && keygenOperation.reshare === 'plugin'
  }, [keygenOperation])

  useEffect(() => {
    if (hasStartedRef.current) return

    hasStartedRef.current = true
    mutate()
  }, [mutate])

  return isPluginReshare ? null : (
    <>
      <PageHeader title={t('fastVaultSetup.connectingWithServer')} hasBorder />
      <MatchQuery
        value={mutationState}
        error={error => (
          <FlowErrorPageContent
            variant="warning"
            title={t('failed_to_connect_with_server')}
            description={t('keygen_failed_description')}
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
