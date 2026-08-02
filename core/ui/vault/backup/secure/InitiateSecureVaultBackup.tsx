import { InitiateVaultShareBackup } from '@core/ui/vault/backup/InitiateVaultShareBackup'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { isServer } from '@vultisig/core-mpc/devices/localPartyId'
import { useTranslation } from 'react-i18next'

type InitiateSecureVaultBackupProps = OnFinishProp & Partial<OnBackProp>

/**
 * Secure-vault backup step of the post-keygen flow. A secure vault has no
 * server password to fall back on, so the user is always offered the password
 * options before the share is saved.
 */
export const InitiateSecureVaultBackup = ({
  onFinish,
  onBack,
}: InitiateSecureVaultBackupProps) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const userDeviceCount = vault.signers.filter(s => !isServer(s)).length

  return (
    <InitiateVaultShareBackup
      onFinish={onFinish}
      onBack={onBack}
      title={t('save_backup_n_of_n_to_cloud', {
        current: 1,
        total: userDeviceCount,
      })}
      description={
        <Text size={14} weight={500} color="shy" centerHorizontally>
          {t('save_backup_description_secure')}{' '}
          <Text as="span" color="shyExtra">
            {t('save_backup_description_2')}
          </Text>
        </Text>
      }
    />
  )
}
