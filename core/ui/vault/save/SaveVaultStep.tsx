import { Vault } from '@core/mpc/vault/Vault'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { usePendingReferral } from '@core/ui/mpc/keygen/create/state/pendingReferral'
import { useCreateVaultWithReferralMutation } from '@core/ui/vault/mutations/useCreateVaultWithReferralMutation'
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

  const [pendingReferral] = usePendingReferral()
  const { mutate, ...mutationState } = useCreateVaultWithReferralMutation({
    onSuccess: onFinish,
  })

  useEffect(() => {
    mutate({ vault: value, pendingReferral })
  }, [mutate, value, pendingReferral])

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
