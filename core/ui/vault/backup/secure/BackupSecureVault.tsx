import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDeleteVaultMutation, useVaults } from '@core/ui/storage/vaults'
import { BackupOverviewScreen } from '@core/ui/vault/backup/BackupOverviewScreen'
import { VaultCreatedSuccessScreen } from '@core/ui/vault/backup/fast/VaultCreatedSuccessScreen'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { ArrowSplitIcon } from '@lib/ui/icons/ArrowSplitIcon'
import { CloudUploadIcon } from '@lib/ui/icons/CloudUploadIcon'
import { isServer } from '@vultisig/core-mpc/devices/localPartyId'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useTranslation } from 'react-i18next'

import { InitiateSecureVaultBackup } from './InitiateSecureVaultBackup'
import { ReviewVaultDevicesScreen } from './ReviewVaultDevicesScreen'

const steps = [
  'reviewDevices',
  'backupOverview',
  'saveBackupToCloud',
  'vaultCreatedSuccess',
] as const

export const BackupSecureVault = () => {
  const { step, toNextStep, toPreviousStep } = useStepNavigation({ steps })
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const vaults = useVaults()
  const navigate = useCoreNavigate()
  const { mutate: deleteVault } = useDeleteVaultMutation()
  const userDeviceCount = vault.signers.filter(s => !isServer(s)).length

  const abandonVault = () => {
    const isLastVault = vaults.length <= 1
    deleteVault(getVaultId(vault), {
      onSuccess: () => navigate({ id: isLastVault ? 'newVault' : 'vault' }),
    })
  }

  const secureInfoRows = [
    {
      id: 'backup-each-device',
      icon: <CloudUploadIcon style={{ fontSize: 24 }} />,
      title: t('secure_backup_each_device'),
      description: t('secure_backup_each_device_description', {
        count: userDeviceCount,
      }),
    },
    {
      id: 'store-backups-separately',
      icon: <ArrowSplitIcon style={{ fontSize: 24 }} />,
      title: t('storeBackupsSeparately'),
      description: t('secure_store_backups_separately_description'),
    },
  ]

  return (
    <Match
      value={step}
      reviewDevices={() => (
        <ReviewVaultDevicesScreen onFinish={toNextStep} onBack={abandonVault} />
      )}
      backupOverview={() => (
        <BackupOverviewScreen
          userDeviceCount={userDeviceCount}
          onFinish={toNextStep}
          onBack={toPreviousStep}
          infoRows={secureInfoRows}
        />
      )}
      saveBackupToCloud={() => (
        <InitiateSecureVaultBackup
          onFinish={toNextStep}
          onBack={toPreviousStep}
        />
      )}
      vaultCreatedSuccess={() => <VaultCreatedSuccessScreen />}
    />
  )
}
