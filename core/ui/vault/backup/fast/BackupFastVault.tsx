import { isServer } from '@core/mpc/devices/localPartyId'
import { useVaultCreationInput } from '@core/ui/mpc/keygen/create/state/vaultCreationInput'
import { BackupOverviewScreen } from '@core/ui/vault/backup/BackupOverviewScreen'
import { EmailConfirmation } from '@core/ui/vault/backup/fast'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { InitiateFastVaultBackup } from './InitiateFastVaultBackup'
import { VaultCreatedSuccessScreen } from './VaultCreatedSuccessScreen'

const steps = [
  'backupOverview',
  'emailVerification',
  'saveVault',
  'backupPage',
  'backupSuccessfulSlideshow',
] as const

type BackupFastVaultProps = OnFinishProp &
  OnBackProp & {
    password: string
    onChangeEmailAndRestart?: () => void
  }

export const BackupFastVault = ({
  onBack,
  password,
  onChangeEmailAndRestart,
}: BackupFastVaultProps) => {
  const { t } = useTranslation()

  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps,
  })
  const vault = useCurrentVault()
  const vaultCreationInput = useVaultCreationInput()
  const email =
    vaultCreationInput && 'fast' in vaultCreationInput
      ? vaultCreationInput.fast.email
      : ''

  return (
    <Match
      value={step}
      backupOverview={() => (
        <BackupOverviewScreen
          userDeviceCount={vault.signers.filter(s => !isServer(s)).length}
          onFinish={toNextStep}
          onBack={onBack}
        />
      )}
      saveVault={() => (
        <SaveVaultStep
          value={vault}
          title={t('creating_vault')}
          onFinish={toNextStep}
          onBack={onBack}
        />
      )}
      emailVerification={() => (
        <EmailConfirmation
          onFinish={toNextStep}
          onBack={toPreviousStep}
          email={email}
          onChangeEmailAndRestart={onChangeEmailAndRestart}
        />
      )}
      backupPage={() => (
        <InitiateFastVaultBackup
          password={password}
          onFinish={toNextStep}
          onBack={toPreviousStep}
        />
      )}
      backupSuccessfulSlideshow={() => <VaultCreatedSuccessScreen />}
    />
  )
}
