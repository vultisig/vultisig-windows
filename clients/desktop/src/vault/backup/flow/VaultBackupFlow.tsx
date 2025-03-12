import { haveServerSigner } from '../../fast/utils/haveServerSigner'
import { BackupFastVault } from '../../setup/fast/backup/BackupFastVault'
import { BackupSecureVault } from '../../setup/secure/backup/BackupSecureVault'
import { useCurrentVault } from '../../state/currentVault'

export const VaultBackupFlow = () => {
  const vault = useCurrentVault()
  if (haveServerSigner(vault.signers)) {
    return <BackupFastVault />
  }

  return <BackupSecureVault isInitiatingDevice={true} />
}
