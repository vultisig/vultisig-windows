import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { useVaultCreationInput } from '@core/ui/mpc/keygen/create/state/vaultCreationInput'
import { useCreateVaultWithReferralMutation } from '@core/ui/vault/mutations/useCreateVaultWithReferralMutation'
import { Button } from '@lib/ui/buttons/Button'
import { FlowPendingPageContent } from '@lib/ui/flow/FlowPendingPageContent'
import { OnBackProp, OnFinishProp, TitleProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { getRecordUnionValue } from '@vultisig/lib-utils/record/union/getRecordUnionValue'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../flow/FlowErrorPageContent'
import { usePasscode } from '../../passcodeEncryption/state/passcode'
import { useIsPasscodeRequired } from '../../passcodeEncryption/state/useIsPasscodeRequired'

export const SaveVaultStep: React.FC<
  ValueProp<Vault> &
    OnFinishProp &
    TitleProp &
    OnBackProp & {
      onVaultSaveError?: (error: Error) => void | Promise<void>
      onVaultSaved?: (vault: Vault) => void | Promise<void>
    }
> = ({ value, onFinish, title, onBack, onVaultSaveError, onVaultSaved }) => {
  const { t } = useTranslation()

  const input = useVaultCreationInput()
  const referral = input ? getRecordUnionValue(input).referral : undefined

  const { mutate, ...mutationState } = useCreateVaultWithReferralMutation({
    onError: onVaultSaveError,
    onSuccess: async vault => {
      await onVaultSaved?.(vault)
      onFinish()
    },
  })

  const hasPasscodeEncryption = useIsPasscodeRequired()
  const [passcode] = usePasscode()

  // Saving seals the key shares with the in-memory passcode. If the app is
  // locked when the ceremony completes, defer the save until unlock instead of
  // firing a mutation that throws and discards the only copy of the new share
  // (#4598) — the passcode prompt is already on screen at that point.
  const canSealKeyShares = !hasPasscodeEncryption || passcode !== null

  useEffect(() => {
    if (!canSealKeyShares) {
      return
    }

    mutate({ vault: value, pendingReferral: referral ?? '' })
  }, [canSealKeyShares, mutate, value, referral])

  return (
    <>
      <FlowPageHeader title={title} />
      <MatchQuery
        value={mutationState}
        inactive={() => <FlowPendingPageContent title={t('saving_vault')} />}
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
