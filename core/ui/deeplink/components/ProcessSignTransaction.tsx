import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useProcessSignTransactionMutation } from '../mutations/useProcessSignTransactionMutation'
import { SignTransactionData } from '../queries/useParseDeeplinkQuery'

export const ProcessSignTransaction = ({
  value,
}: ValueProp<SignTransactionData>) => {
  const { t } = useTranslation()
  const { mutate, ...mutationState } = useProcessSignTransactionMutation()

  useEffect(() => {
    mutate(value)
  }, [value, mutate])

  return (
    <>
      <FlowPageHeader title={t('joining_keysign')} />
      <MatchQuery
        value={mutationState}
        success={() => null}
        pending={() => (
          <FlowPendingPageContent title={t('processing_transaction')} />
        )}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_join_keysign')}
            error={error}
          />
        )}
      />
    </>
  )
}
