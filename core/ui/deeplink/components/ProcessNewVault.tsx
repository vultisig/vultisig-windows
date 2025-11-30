import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { NewVaultData } from '../core'
import { useProcessNewVaultMutation } from '../mutations/useProcessNewVaultMutation'

export const ProcessNewVault = ({ value }: ValueProp<NewVaultData>) => {
  const { t } = useTranslation()
  const { mutate, ...mutationState } = useProcessNewVaultMutation()

  useEffect(() => {
    mutate(value)
  }, [value, mutate])

  return (
    <>
      <FlowPageHeader title={t('joining_keygen')} />
      <MatchQuery
        value={mutationState}
        success={() => null}
        pending={() => <FlowPendingPageContent title={t('processing_url')} />}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_join_keygen')}
            error={error}
          />
        )}
      />
    </>
  )
}
