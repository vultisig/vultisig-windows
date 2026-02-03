import { hasServer } from '@core/mpc/devices/localPartyId'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'

import { BackupFastVault } from '../../../vault/backup/fast/BackupFastVault'
import { BackupSecureVault } from '../../../vault/backup/secure/BackupSecureVault'

type VaultKeygenBackupFlowProps = OnFinishProp &
  OnBackProp & {
    password?: string
  }

export const VaultKeygenBackupFlow = ({
  onFinish,
  onBack,
  password = '',
}: VaultKeygenBackupFlowProps) => {
  const vault = useCurrentVault()

  if (hasServer(vault.signers)) {
    return (
      <BackupFastVault
        password={password}
        onFinish={onFinish}
        onBack={onBack}
      />
    )
  }

  return <BackupSecureVault onFinish={onFinish} />
}
