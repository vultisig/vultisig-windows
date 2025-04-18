import { hasServer } from '@core/mpc/devices/localPartyId'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'

import { BackupFastVault } from '../../../vault/backup/fast/BackupFastVault'
import { BackupSecureVault } from '../../../vault/backup/secure/BackupSecureVault'

export const VaultKeygenBackupFlow = ({
  onFinish,
  onBack,
}: OnFinishProp & OnBackProp) => {
  const vault = useCurrentVault()

  if (hasServer(vault.signers)) {
    return <BackupFastVault onFinish={onFinish} onBack={onBack} />
  }

  return <BackupSecureVault onFinish={onFinish} />
}
