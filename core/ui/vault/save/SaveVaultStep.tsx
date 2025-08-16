import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useCreateVaultMutation } from '@core/ui/vault/mutations/useCreateVaultMutation'
import { Vault } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { OnBackProp, OnFinishProp, TitleProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../flow/FlowErrorPageContent'

export const SaveVaultStep: React.FC<
  ValueProp<Vault> & OnFinishProp & TitleProp & OnBackProp
> = ({ value, onFinish, title, onBack }) => {
  const { t } = useTranslation()

  const { mutate, ...mutationState } = useCreateVaultMutation({
    onSuccess: onFinish,
  })

  useEffect(() => {
    mutate(value)
  }, [mutate, value])

  return (
    <>
      <FlowPageHeader title={title} />
      <MatchQuery
        value={mutationState}
        pending={() => <FlowPendingPageContent title={t('saving_vault')} />}
        success={() => null}
        error={error => (
          <FlowErrorPageContent
            title={t('failed_to_save_vault')}
            error={error}
            action={<Button onClick={onBack}>{t('back')}</Button>}
          />
        )}
      />
    </>
  )
}
