import { hasServerSigner } from '../../fast/utils/hasServerSigner'
import { BackupFastVault } from '../../setup/fast/backup/BackupFastVault'
import { BackupSecureVault } from '../../setup/secure/backup/BackupSecureVault'
import { useCurrentVault } from '../../state/currentVault'

export const VaultBackupFlow = () => {
  const vault = useCurrentVault()

  if (hasServerSigner(vault.signers)) {
    return <BackupFastVault />
  }

  return <BackupSecureVault />
}
