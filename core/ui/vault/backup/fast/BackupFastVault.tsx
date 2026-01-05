import { useVaults } from '@core/ui/storage/vaults'
import { EmailConfirmation } from '@core/ui/vault/backup/fast'
import { BackupOverviewSlidesPartOne } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartOne'
import { BackupOverviewSlidesPartTwo } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartTwo'
import { VaultBackupSummaryStep } from '@core/ui/vault/backup/VaultBackupSummaryStep'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { InitiateFastVaultBackup } from './InitiateFastVaultBackup'

const steps = [
  'backupSlideshowPartOne',
  'emailVerification',
  'saveVault',
  'backupSlideshowPartTwo',
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
  // @antonio: by design we only need to show the summary step if user has more than 2 vaults
  const shouldShowBackupSummary = vaults.length > 1

  return (
    <Match
      value={step}
      backupSlideshowPartOne={() => (
        <BackupOverviewSlidesPartOne onFinish={toNextStep} />
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
        <EmailConfirmation onFinish={toNextStep} onBack={toPreviousStep} />
      )}
      backupSlideshowPartTwo={() => (
        <BackupOverviewSlidesPartTwo onFinish={toNextStep} />
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
