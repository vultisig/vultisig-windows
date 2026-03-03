import { isServer } from '@core/mpc/devices/localPartyId'
import { BackupOverviewScreen } from '@core/ui/vault/backup/BackupOverviewScreen'
import { VaultCreatedSuccessScreen } from '@core/ui/vault/backup/fast/VaultCreatedSuccessScreen'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Match } from '@lib/ui/base/Match'
import { useStepNavigation } from '@lib/ui/hooks/useStepNavigation'
import { ArrowSplitIcon } from '@lib/ui/icons/ArrowSplitIcon'
import { CloudUploadIcon } from '@lib/ui/icons/CloudUploadIcon'
import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { InitiateSecureVaultBackup } from './InitiateSecureVaultBackup'
import { ReviewVaultDevicesScreen } from './ReviewVaultDevicesScreen'

const steps = [
  'reviewDevices',
  'backupOverview',
  'saveBackupToCloud',
  'vaultCreatedSuccess',
] as const

export const BackupSecureVault = ({ onFinish }: OnFinishProp) => {
  const { step, toNextStep, toPreviousStep } = useStepNavigation({ steps })
  const { t } = useTranslation()
  const vault = useCurrentVault()
  const userDeviceCount = vault.signers.filter(s => !isServer(s)).length

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
        <ReviewVaultDevicesScreen onFinish={toNextStep} onBack={onFinish} />
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
