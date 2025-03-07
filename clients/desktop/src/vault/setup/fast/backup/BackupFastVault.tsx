import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { storage } from '../../../../../wailsjs/go/models'
import { FEATURE_FLAGS } from '../../../../constants'
import { Match } from '../../../../lib/ui/base/Match'
import { StepTransition } from '../../../../lib/ui/base/StepTransition'
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation'
import { appPaths } from '../../../../navigation'
import { useVaults } from '../../../queries/useVaultsQuery'
import { getStorageVaultId } from '../../../utils/storageVault'
import { SetupVaultSummaryStep } from '../../shared/SetupVaultSummaryStep'
import { SetupVaultSummaryStepOld } from '../../shared/SetupVaultSummaryStepOld'
import VaultBackupPage from '../../shared/vaultBackupSettings/VaultBackupPage'
import { EmailConfirmation } from '.'
import { BackupConfirmation } from './BackupConfirmation'
import { BackupOverviewSlidesPartOne } from './BackupOverviewSlidesPartOne'
import { BackupOverviewSlidesPartTwo } from './BackupOverviewSlidesPartTwo'
import { BackupSuccessSlide } from './BackupSuccessSlides'

const steps = [
  'backupSlideshowPartOne',
  'emailVerification',
  'backupSlideshowPartTwo',
  'backupConfirmation',
  'backupPage',
  'backupSuccessfulSlideshow',
] as const

type BackupFastVaultProps = {
  vault: storage.Vault
}

export const BackupFastVault: FC<BackupFastVaultProps> = ({ vault }) => {
  const navigate = useNavigate()
  const vaultId = getStorageVaultId(vault)
  const { step, toNextStep } = useStepNavigation({
    steps,
  })
  const vaults = useVaults()
  // @antonio: by design we only need to show the summary step if user has more than 2 vaults
  const shouldShowBackupSummary = vaults.length > 1

  return (
    <Match
      value={step}
      backupSlideshowPartOne={() => (
        <BackupOverviewSlidesPartOne onCompleted={toNextStep} />
      )}
      emailVerification={() => (
        <EmailConfirmation onCompleted={toNextStep} vaultId={vaultId} />
      )}
      backupSlideshowPartTwo={() => (
        <BackupOverviewSlidesPartTwo onCompleted={toNextStep} />
      )}
      backupConfirmation={() => <BackupConfirmation onCompleted={toNextStep} />}
      backupPage={() => (
        <VaultBackupPage onBackupCompleted={toNextStep} vault={vault} />
      )}
      backupSuccessfulSlideshow={() =>
        shouldShowBackupSummary ? (
          <StepTransition
            from={({ onForward }) =>
              FEATURE_FLAGS.ENABLE_NEW_SUMMARY_PAGES ? (
                <SetupVaultSummaryStep onForward={onForward} vaultType="fast" />
              ) : (
                <SetupVaultSummaryStepOld
                  onForward={onForward}
                  vaultType="fast"
                />
              )
            }
            to={() => (
              <BackupSuccessSlide
                onCompleted={() => navigate(appPaths.vault)}
              />
            )}
          />
        ) : (
          <BackupSuccessSlide onCompleted={() => navigate(appPaths.vault)} />
        )
      }
    />
  )
}
