import { hasServer } from '@core/mpc/devices/localPartyId'
import { Opener } from '@lib/ui/base/Opener'
import { CloudIcon } from '@lib/ui/icons/CloudIcon'
import { FolderUploadIcon } from '@lib/ui/icons/FolderUploadIcon'
import { TabletSmartphoneIcon } from '@lib/ui/icons/TabletSmartphoneIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Modal } from '@lib/ui/modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { CoreView } from '../../../navigation/CoreView'
import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '../../state/currentVault'
import { ListItemIconWrapper } from '..'
import { BackupOption } from './BackupOption'

const backupOptionTypes = ['device', 'server'] as const
type BackupOptionType = (typeof backupOptionTypes)[number]

const backupOptionIcon: Record<BackupOptionType, React.FC> = {
  device: TabletSmartphoneIcon,
  server: CloudIcon,
}

const backupOptionView: Record<BackupOptionType, CoreView> = {
  device: { id: 'selectVaultsBackup' },
  server: { id: 'requestFastVaultBackup' },
}

export const VaultSettingsBackup = () => {
  const navigate = useCoreNavigate()

  const { t } = useTranslation()
  const { colors } = useTheme()
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
      renderContent={({ onClose }) => (
        <Modal title={t('choose_backup_method')} onClose={onClose}>
          <VStack gap={16}>
            {backupOptionTypes.map(option => {
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
