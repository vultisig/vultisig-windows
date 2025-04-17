import { hasServer } from '@core/mpc/devices/localPartyId'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'

import { BackupFastVault } from '../setup/fast/backup/BackupFastVault'

export const VaultKeygenBackupFlow = ({
  onFinish,
  onBack,
}: OnFinishProp & OnBackProp) => {
  const vault = useCurrentVault()

  if (hasServer(vault.signers)) {
    return <BackupFastVault onFinish={onFinish} onBack={onBack} />
  }

  // TODO: allow for this when set up secure vault is available
  // return <BackupSecureVault onFinish={onFinish} />
}
