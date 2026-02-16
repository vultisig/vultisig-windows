import { getVaultId } from '@core/mpc/vault/Vault'
import { BackupInCloudScreen } from '@core/ui/vault/backup/BackupInCloudScreen'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'

import { useCurrentVault } from '../../state/currentVault'

type InitiateFastVaultBackupProps = OnFinishProp &
  OnBackProp & {
    password: string
  }

export const InitiateFastVaultBackup = ({
  onFinish,
  onBack,
  password,
}: InitiateFastVaultBackupProps) => {
  const vault = useCurrentVault()

  const { mutate: backupVault, isPending } = useBackupVaultMutation({
    onSuccess: onFinish,
    vaultIds: [getVaultId(vault)],
  })

  return (
    <BackupInCloudScreen
      onBack={onBack}
      ctaLoading={isPending}
      onContinue={() => backupVault({ password })}
    />
  )
}
