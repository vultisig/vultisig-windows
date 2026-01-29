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

export const BackupFastVault = ({
  onFinish,
  onBack,
}: OnFinishProp & OnBackProp) => {
  const { t } = useTranslation()

  const { step, toNextStep, toPreviousStep } = useStepNavigation({
    steps,
  })
  const vaults = useVaults()
  const vault = useCurrentVault()
  const shouldShowBackupSummary = vaults.length > 1

  return (
    <Match
      value={step}
      backupOverview={() => <BackupOverviewScreen onFinish={toNextStep} />}
      saveVault={() => (
        <SaveVaultStep
          value={vault}
          title={t('creating_vault')}
          onFinish={toNextStep}
          onBack={onBack}
        />
      )}
      emailVerification={() => (
        <EmailConfirmation onFinish={toNextStep} onBack={toPreviousStep} />
      )}
      backupPage={() => (
        <InitiateFastVaultBackup
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
