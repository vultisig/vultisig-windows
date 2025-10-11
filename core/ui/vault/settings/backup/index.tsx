import { hasServer } from '@core/mpc/devices/localPartyId'
import { Opener } from '@lib/ui/base/Opener'
import { FolderUploadIcon } from '@lib/ui/icons/FolderUploadIcon'
import { ListItem } from '@lib/ui/list/item'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { CoreView } from '../../../navigation/CoreView'
import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '../../state/currentVault'
import { DescriptionText, ListItemIconWrapper } from '..'
import { BackupModal, BackupOptionType } from './BackupModal'

export const backupOptionView: Record<BackupOptionType, CoreView> = {
  device: { id: 'selectVaultsBackup' },
  server: { id: 'requestFastVaultBackup' },
}

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
