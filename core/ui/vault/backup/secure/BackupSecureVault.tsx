import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useVaults } from '@core/ui/storage/vaults'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnFinishProp } from '@lib/ui/props'

import { VaultBackupFlow } from '../VaultBackupFlow'
import { VaultBackupSummaryStep } from '../VaultBackupSummaryStep'
import { BackupConfirmation } from './BackupConfirmation'
import { BackupOverviewSlidesPartOne } from './BackupOverviewSlidesPartOne'
import { PairingDeviceBackupOverviewSlidesPartOne } from './PairingDeviceBackupOverviewSlidesPartOne'

const steps = [
  'backupSlideshowPartOne',
  'backupConfirmation',
  'backupPage',
  'backupSuccessfulSlideshow',
] as const

export const BackupSecureVault = ({ onFinish }: OnFinishProp) => {
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
      backupPage={() => (
        <VaultBackupFlow
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
