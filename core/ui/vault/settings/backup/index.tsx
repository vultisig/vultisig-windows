import { SettingsItem } from '@core/ui/settings/SettingsItem'
import { Opener } from '@lib/ui/base/Opener'
import { CloudDownloadIcon } from '@lib/ui/icons/CloudDownloadIcon'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '../../state/currentVault'
import { BackupModal } from './BackupModal'
import { backupOptionView } from './routes'

export const VaultSettingsBackup = () => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()
  const vault = useCurrentVault()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <SettingsItem
          description={t('backup_description')}
          icon={<CloudDownloadIcon />}
          onClick={() =>
            hasServer(vault.signers)
              ? onOpen()
              : navigate(backupOptionView.device)
          }
          title={t('backup_vault_share')}
        />
      )}
      renderContent={({ onClose }) => <BackupModal onClose={onClose} />}
    />
  )
}
