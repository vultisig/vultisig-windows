import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'

import { BackupFastVault } from '../../../vault/backup/fast/BackupFastVault'
import { BackupSecureVault } from '../../../vault/backup/secure/BackupSecureVault'
import { willUsePostKeygenFastBackupPath } from './willUsePostKeygenFastBackupPath'

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

  if (willUsePostKeygenFastBackupPath(vault)) {
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
