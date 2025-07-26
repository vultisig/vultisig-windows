import { useIsInitiatingDevice } from '@core/ui/mpc/state/isInitiatingDevice'
import { useVaults } from '@core/ui/storage/vaults'
import { BackupConfirmation } from '@core/ui/vault/backup/confirmation'
import { BackupOverviewSlidesPartOne } from '@core/ui/vault/backup/secure/BackupOverviewSlidesPartOne'
import { PairingDeviceBackupOverviewSlidesPartOne } from '@core/ui/vault/backup/secure/PairingDeviceBackupOverviewSlidesPartOne'
import { VaultBackupFlow } from '@core/ui/vault/backup/VaultBackupFlow'
import { VaultBackupSummaryStep } from '@core/ui/vault/backup/VaultBackupSummaryStep'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnFinishProp } from '@lib/ui/props'
import { useRive } from '@rive-app/react-canvas'

const steps = [
  'backupSlideshowPartOne',
  'backupConfirmation',
  'backupPage',
  'backupSuccessfulSlideshow',
] as const

export const BackupSecureVault = ({ onFinish }: OnFinishProp) => {
  const { RiveComponent } = useRive({
    src: '/core/animations/backup-vault-splash.riv',
    autoplay: true,
  })
  const { step, toNextStep } = useStepNavigation({ steps })
  const vaults = useVaults()
  const shouldShowBackupSummary = vaults.length > 1
  const isInitiatingDevice = useIsInitiatingDevice()

  return (
    <Match
      value={step}
      backupSlideshowPartOne={() =>
        isInitiatingDevice ? (
          <BackupOverviewSlidesPartOne onFinish={toNextStep} />
        ) : (
          <PairingDeviceBackupOverviewSlidesPartOne onFinish={toNextStep} />
        )
      }
      backupConfirmation={() => (
        <BackupConfirmation
          onCompleted={toNextStep}
          riveComponent={<RiveComponent />}
        />
      )}
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
