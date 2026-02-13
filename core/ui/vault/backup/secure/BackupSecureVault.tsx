import { isServer } from '@core/mpc/devices/localPartyId'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useVaults } from '@core/ui/storage/vaults'
import { BackupInCloudScreen } from '@core/ui/vault/backup/BackupInCloudScreen'
import { BackupOverviewScreen } from '@core/ui/vault/backup/BackupOverviewScreen'
import { VaultBackupFlow } from '@core/ui/vault/backup/VaultBackupFlow'
import { VaultBackupSummaryStep } from '@core/ui/vault/backup/VaultBackupSummaryStep'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { OnFinishProp } from '@lib/ui/props'

import { useCurrentVault } from '../../state/currentVault'

const steps = [
  'backupOverview',
  'backupConfirmation',
  'backupPage',
  'backupSuccessfulSlideshow',
] as const

export const BackupSecureVault = ({ onFinish }: OnFinishProp) => {
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
      backupConfirmation={() => <BackupInCloudScreen onContinue={toNextStep} />}
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
