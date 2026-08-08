import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Vault } from '@vultisig/core-mpc/vault/Vault'

import { BackupFastVault } from '../../../vault/backup/fast/BackupFastVault'
import { BackupSecureVault } from '../../../vault/backup/secure/BackupSecureVault'
import { willUsePostKeygenFastBackupPath } from './willUsePostKeygenFastBackupPath'

type VaultKeygenBackupFlowProps = OnFinishProp &
  OnBackProp & {
    password?: string
    onChangeEmailAndRestart?: () => void
    onVaultSaveError?: (error: Error) => void | Promise<void>
    onVaultSaved?: (vault: Vault) => void | Promise<void>
  }

export const VaultKeygenBackupFlow = ({
  onFinish,
  onBack,
  password = '',
  onChangeEmailAndRestart,
  onVaultSaveError,
  onVaultSaved,
}: VaultKeygenBackupFlowProps) => {
  const vault = useCurrentVault()

  if (willUsePostKeygenFastBackupPath(vault)) {
    return (
      <BackupFastVault
        password={password}
        onFinish={onFinish}
        onBack={onBack}
        onChangeEmailAndRestart={onChangeEmailAndRestart}
        onVaultSaveError={onVaultSaveError}
        onVaultSaved={onVaultSaved}
      />
    )
  }

  return <BackupSecureVault />
}
