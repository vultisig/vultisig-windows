import { Vault } from '@core/mpc/vault/Vault'
import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useVaultCreationInput } from '@core/ui/mpc/keygen/create/state/vaultCreationInput'
import { useCreateVaultWithReferralMutation } from '@core/ui/vault/mutations/useCreateVaultWithReferralMutation'
import { Button } from '@lib/ui/buttons/Button'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { OnBackProp, OnFinishProp, TitleProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { getRecordUnionValue } from '@lib/utils/record/union/getRecordUnionValue'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../flow/FlowErrorPageContent'

type SaveVaultStepProps = ValueProp<Vault> &
  OnFinishProp &
  TitleProp &
  OnBackProp & {
    pendingReferral?: string
  }

export const SaveVaultStep: React.FC<SaveVaultStepProps> = ({
  value,
  onFinish,
  title,
  onBack,
  pendingReferral = '',
}) => {
  const { t } = useTranslation()

  const input = useVaultCreationInput()
  const referral = input ? getRecordUnionValue(input).referral : undefined

  const { mutate, ...mutationState } = useCreateVaultWithReferralMutation({
    onSuccess: onFinish,
  })

  useEffect(() => {
    mutate({ vault: value, pendingReferral: referral ?? '' })
  }, [mutate, value, referral])

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
