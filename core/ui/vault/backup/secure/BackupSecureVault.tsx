import { isServer } from '@core/mpc/devices/localPartyId'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useVaults } from '@core/ui/storage/vaults'
import { BackupOverviewScreen } from '@core/ui/vault/backup/BackupOverviewScreen'
import { BackupConfirmation } from '@core/ui/vault/backup/confirmation'
import { VaultBackupFlow } from '@core/ui/vault/backup/VaultBackupFlow'
import { VaultBackupSummaryStep } from '@core/ui/vault/backup/VaultBackupSummaryStep'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnFinishProp } from '@lib/ui/props'
import { useRive } from '@rive-app/react-webgl2'

import { useCurrentVault } from '../../state/currentVault'

const steps = [
  'backupOverview',
  'backupConfirmation',
  'backupPage',
  'backupSuccessfulSlideshow',
] as const

export const BackupSecureVault = ({ onFinish }: OnFinishProp) => {
  const { RiveComponent } = useRive({
    src: '/core/animations/backup-vault-splash.riv',
    autoplay: true,
  })
  const { step, toNextStep, toPreviousStep } = useStepNavigation({ steps })
  const vaults = useVaults()
  const shouldShowBackupSummary = vaults.length > 1

  const vault = useCurrentVault()

  return (
    <Match
      value={step}
      backupOverview={() => (
        <BackupOverviewScreen
          userDeviceCount={vault.signers.filter(s => !isServer(s)).length}
          onFinish={toNextStep}
        />
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
          onBack={toPreviousStep}
        />
      )}
      backupSuccessfulSlideshow={() => (
        <VaultBackupSummaryStep onFinish={onFinish} />
      )}
    />
  )
}
