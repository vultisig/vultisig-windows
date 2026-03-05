import { isServer } from '@core/mpc/devices/localPartyId'
import { getVaultId } from '@core/mpc/vault/Vault'
import { SaveBackupToCloudScreen } from '@core/ui/vault/backup/fast/SaveBackupToCloudScreen'
import { useBackupVaultMutation } from '@core/ui/vault/mutations/useBackupVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

type InitiateSecureVaultBackupProps = OnFinishProp & Partial<OnBackProp>

export const InitiateSecureVaultBackup = ({
  onFinish,
  onBack,
}: InitiateSecureVaultBackupProps) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const userDeviceCount = vault.signers.filter(s => !isServer(s)).length

  const { mutate: backupVault, isPending } = useBackupVaultMutation({
    onSuccess: onFinish,
    vaultIds: [getVaultId(vault)],
  })

  return (
    <SaveBackupToCloudScreen
      onBack={onBack}
      ctaLoading={isPending}
      onContinue={() => backupVault({})}
      title={t('save_backup_n_of_n_to_cloud', {
        current: 1,
        total: userDeviceCount,
      })}
      description={
        <>
          <Text size={14} weight={500} color="shy" centerHorizontally>
            {t('save_backup_description_secure')}
          </Text>
          <Text size={14} weight={500} color="shyExtra" centerHorizontally>
            {t('save_backup_description_2')}
          </Text>
        </>
      }
    />
  )
}
