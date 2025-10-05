import { Opener } from '@lib/ui/base/Opener'
import { CloudIcon } from '@lib/ui/icons/CloudIcon'
import { HardDriveDownloadIcon } from '@lib/ui/icons/HardDriveDownloadIcon'
import { TabletSmartphoneIcon } from '@lib/ui/icons/TabletSmartphoneIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Modal } from '@lib/ui/modal'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { CoreView } from '../../../navigation/CoreView'
import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { BackupOption } from './BackupOption'

const backupOptions = ['device', 'server'] as const
type BackupOption = (typeof backupOptions)[number]

const backupOptionIcon: Record<BackupOption, React.FC> = {
  device: TabletSmartphoneIcon,
  server: CloudIcon,
}

const backupOptionView: Record<BackupOption, CoreView> = {
  device: { id: 'vaultBackup' },
  server: { id: 'requestFastVaultBackup' },
}

export const VaultSettingsBackup = () => {
  const navigate = useCoreNavigate()

  const { t } = useTranslation()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <ListItem
          icon={<HardDriveDownloadIcon fontSize={20} />}
          onClick={onOpen}
          title={t('backup')}
          hoverable
          showArrow
        />
      )}
      renderContent={({ onClose }) => (
        <Modal title={t('choose_backup_method')} onClose={onClose}>
          <VStack gap={16}>
            {backupOptions.map(option => {
              const Icon = backupOptionIcon[option]
              return (
                <BackupOption
                  title={t(`${option}_backup`)}
                  key={option}
                  icon={<Icon />}
                  onClick={() => navigate(backupOptionView[option])}
                >
                  {t(`${option}_backup_description`)}
                </BackupOption>
              )
            })}
          </VStack>
        </Modal>
      )}
    />
  )
}
