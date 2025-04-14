import { hasServer } from '@core/mpc/devices/localPartyId'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { OnFinishProp } from '@lib/ui/props'

import { BackupFastVault } from '../../setup/fast/backup/BackupFastVault'
import { BackupSecureVault } from '../../setup/secure/backup/BackupSecureVault'

export const VaultKeygenBackupFlow = ({ onFinish }: OnFinishProp) => {
  const vault = useCurrentVault()

  if (hasServer(vault.signers)) {
    return <BackupFastVault onFinish={onFinish} />
  }

  return <BackupSecureVault onFinish={onFinish} />
}
