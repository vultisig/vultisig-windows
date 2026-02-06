import { isServer } from '@core/mpc/devices/localPartyId'
import { useVaultCreationInput } from '@core/ui/mpc/keygen/create/state/vaultCreationInput'
import { useVaults } from '@core/ui/storage/vaults'
import { BackupOverviewScreen } from '@core/ui/vault/backup/BackupOverviewScreen'
import { EmailConfirmation } from '@core/ui/vault/backup/fast'
import { VaultBackupSummaryStep } from '@core/ui/vault/backup/VaultBackupSummaryStep'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { InitiateFastVaultBackup } from './InitiateFastVaultBackup'

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
  onFinish,
  onBack,
  password,
  onChangeEmailAndRestart,
}: BackupFastVaultProps) => {
  const { t } = useTranslation()

  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps,
  })
  const vaults = useVaults()
  const vault = useCurrentVault()
  const vaultCreationInput = useVaultCreationInput()
  const email =
    vaultCreationInput && 'fast' in vaultCreationInput
      ? vaultCreationInput.fast.email
      : ''
  // @antonio: by design we only need to show the summary step if user has more than 2 vaults
  const shouldShowBackupSummary = vaults.length > 1

  return (
    <Match
      value={step}
      backupOverview={() => (
        <BackupOverviewScreen
          userDeviceCount={vault.signers.filter(s => !isServer(s)).length}
          onFinish={toNextStep}
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
          onFinish={() => {
            if (shouldShowBackupSummary) {
              toNextStep()
            } else {
              onFinish()
            }
          }}
          onBack={toPreviousStep}
        />
      )}
      backupSuccessfulSlideshow={() => (
        <VaultBackupSummaryStep onFinish={onFinish} />
      )}
    />
  )
}
