import { Opener } from '@lib/ui/base/Opener'
import { FolderUploadIcon } from '@lib/ui/icons/FolderUploadIcon'
import { ListItem } from '@lib/ui/list/item'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { useTranslation } from 'react-i18next'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '../../state/currentVault'
import {
  DescriptionText,
  ListItemIconWrapper,
} from '../vaultSettingsListStyles'
import { BackupModal } from './BackupModal'
import { backupOptionView } from './routes'

export const VaultSettingsBackup = () => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()
  const vault = useCurrentVault()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <ListItem
          icon={
            <ListItemIconWrapper>
              <FolderUploadIcon />
            </ListItemIconWrapper>
          }
          description={
            <DescriptionText>{t('backup_description')}</DescriptionText>
          }
          onClick={() =>
            hasServer(vault.signers)
              ? onOpen()
              : navigate(backupOptionView.device)
          }
          title={t('backup')}
          hoverable
          showArrow
        />
      )}
      renderContent={({ onClose }) => <BackupModal onClose={onClose} />}
    />
  )
}
