import { SaveBackupToCloudScreen } from '@core/ui/vault/backup/fast/SaveBackupToCloudScreen'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'

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
    <SaveBackupToCloudScreen
      onBack={onBack}
      ctaLoading={isPending}
      onContinue={() => backupVault({ password })}
    />
  )
}
