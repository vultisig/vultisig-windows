import { useVaults } from '@core/ui/storage/vaults'
import { BackupConfirmation } from '@core/ui/vault/backup/confirmation'
import { EmailConfirmation } from '@core/ui/vault/backup/fast'
import { BackupOverviewSlidesPartOne } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartOne'
import { BackupOverviewSlidesPartTwo } from '@core/ui/vault/backup/fast/BackupOverviewSlidesPartTwo'
import { VaultBackupFlow } from '@core/ui/vault/backup/VaultBackupFlow'
import { VaultBackupSummaryStep } from '@core/ui/vault/backup/VaultBackupSummaryStep'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { useRive } from '@rive-app/react-canvas'
import { useTranslation } from 'react-i18next'

import { getVaultId } from '../../Vault'

const steps = [
  'backupSlideshowPartOne',
  'emailVerification',
  'saveVault',
  'backupSlideshowPartTwo',
  'backupConfirmation',
  'backupPage',
  'backupSuccessfulSlideshow',
] as const

export const BackupFastVault = ({
  onFinish,
  onBack,
}: OnFinishProp & OnBackProp) => {
  const { t } = useTranslation()
  const { RiveComponent } = useRive({
    src: '/core/animations/fast-vault-backup-splash.riv',
    autoplay: true,
  })
  const { step, toNextStep } = useStepNavigation({
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
      emailVerification={() => <EmailConfirmation onFinish={toNextStep} />}
      backupSlideshowPartTwo={() => (
        <BackupOverviewSlidesPartTwo onFinish={toNextStep} />
      )}
      backupConfirmation={() => (
        <BackupConfirmation
          onCompleted={toNextStep}
          riveComponent={<RiveComponent />}
        />
      )}
      backupPage={() => (
        <VaultBackupFlow
          vaultIds={[getVaultId(vault)]}
          onFinish={() => {
            if (shouldShowBackupSummary) {
              toNextStep()
            } else {
              onFinish()
            }
          }}
        />
      )}
      backupSuccessfulSlideshow={() => (
        <VaultBackupSummaryStep onFinish={onFinish} />
      )}
    />
  )
}
