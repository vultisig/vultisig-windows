import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'

import { BackupFastVault } from '../../../vault/backup/fast/BackupFastVault'
import { BackupSecureVault } from '../../../vault/backup/secure/BackupSecureVault'

type VaultKeygenBackupFlowProps = OnFinishProp &
  OnBackProp & {
    password?: string
    onChangeEmailAndRestart?: () => void
  }

export const VaultKeygenBackupFlow = ({
  onFinish,
  onBack,
  password = '',
  onChangeEmailAndRestart,
}: VaultKeygenBackupFlowProps) => {
  const vault = useCurrentVault()

  if (hasServer(vault.signers)) {
    return (
      <BackupFastVault
        password={password}
        onFinish={onFinish}
        onBack={onBack}
        onChangeEmailAndRestart={onChangeEmailAndRestart}
      />
    )
  }

  return <BackupSecureVault onFinish={onFinish} />
}
