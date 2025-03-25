import { useNavigate } from 'react-router-dom'

import { Match } from '../../../../lib/ui/base/Match'
import { StepTransition } from '../../../../lib/ui/base/StepTransition'
import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation'
import { useIsInitiatingDevice } from '../../../../mpc/state/isInitiatingDevice'
import { appPaths } from '../../../../navigation'
import { useVaults } from '../../../queries/useVaultsQuery'
import { SetupVaultSummaryStep } from '../../shared/SetupVaultSummaryStep'
import VaultBackupPage from '../../shared/vaultBackupSettings/VaultBackupPage'
import { BackupConfirmation } from './BackupConfirmation'
import { BackupOverviewSlidesPartOne } from './BackupOverviewSlidesPartOne'
import { BackupSuccessSlide } from './BackupSuccessSlides'
import { PairingDeviceBackupOverviewSlidesPartOne } from './PairingDeviceBackupOverviewSlidesPartOne'

const steps = [
  'backupSlideshowPartOne',
  'backupConfirmation',
  'backupPage',
  'backupSuccessfulSlideshow',
] as const

export const BackupSecureVault = () => {
  const navigate = useNavigate()
  const { step, toNextStep } = useStepNavigation({
    steps,
  })
  const vaults = useVaults()
  const shouldShowBackupSummary = vaults.length > 1

  const isInitiatingDevice = useIsInitiatingDevice()

  return (
    <Match
      value={step}
      backupSlideshowPartOne={() =>
        isInitiatingDevice ? (
          <BackupOverviewSlidesPartOne onCompleted={toNextStep} />
        ) : (
          <PairingDeviceBackupOverviewSlidesPartOne onCompleted={toNextStep} />
        )
      }
      backupConfirmation={() => <BackupConfirmation onCompleted={toNextStep} />}
      backupPage={() => <VaultBackupPage onFinish={toNextStep} />}
      backupSuccessfulSlideshow={() =>
        shouldShowBackupSummary ? (
          <StepTransition
            from={({ onForward }) => (
              <SetupVaultSummaryStep onForward={onForward} />
            )}
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
