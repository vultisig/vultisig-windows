import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CloudDownloadIcon } from '@lib/ui/icons/CloudDownloadIcon'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { LaptopMobileIcon } from '@lib/ui/icons/LaptopMobileIcon'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Backdrop } from '@lib/ui/modal/Backdrop'
import { OnCloseProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useResponsiveness } from '../../../providers/ResponsivenessProvider'
import { settingsBackdropStyles } from '../../../settings/constants'
import { SettingsBaselineText } from '../../../settings/SettingsBaselineText'
import { BackupOption } from './BackupOption'
import { BackupOptionType, backupOptionTypes } from './options'
import { backupOptionView } from './routes'

const backupOptionIcon: Record<BackupOptionType, React.FC> = {
  device: LaptopMobileIcon,
  server: CloudDownloadIcon,
}

const closeIconSize = 16

/** The chooser between a device and a server backup: a sheet when small, a modal otherwise. */
export const BackupModal = ({ onClose }: OnCloseProp) => {
  const navigate = useCoreNavigate()
  const { isSmall } = useResponsiveness()
  const { t } = useTranslation()

  const modalContent = () => (
    <VStack gap={14}>
      {backupOptionTypes.map(option => {
        const Icon = backupOptionIcon[option]
        return (
          <BackupOption
            title={t(`${option}_backup`)}
            key={option}
            icon={<Icon />}
            onClick={() => navigate(backupOptionView[option])}
            data-testid={`backup-option-${option}`}
          >
            {t(`${option}_backup_description`)}
          </BackupOption>
        )
      })}
    </VStack>
  )

  if (isSmall) {
    return (
      <Backdrop onClose={onClose} style={settingsBackdropStyles}>
        <Wrapper>
          <Header alignItems="center" justifyContent="space-between" gap={12}>
            <SettingsBaselineText color="shyExtra" variant="subtitle">
              {t('choose_backup_method')}
            </SettingsBaselineText>
            <CloseButton aria-label={t('close')} onClick={onClose} size="sm">
              <CrossIcon />
            </CloseButton>
          </Header>
          {modalContent()}
        </Wrapper>
      </Backdrop>
    )
  }

  return (
    <Modal title={t('choose_backup_method')} onClose={onClose}>
      <DesktopModalWrapper>{modalContent()}</DesktopModalWrapper>
    </Modal>
  )
}

const Wrapper = styled.div`
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;

  ${vStack({
    gap: 24,
  })};

  ${borderRadius.lg};
  padding: 24px 20px;
  background: ${getColor('foreground')};
`

const Header = styled(HStack)`
  border-bottom: 1px solid ${getColor('foregroundExtra')};
  padding-bottom: 23px;
`

const CloseButton = styled(IconButton)`
  color: ${getColor('textShy')};
  flex-shrink: 0;
  font-size: ${closeIconSize}px;
  margin-block: -6px;
  margin-right: ${(closeIconSize - iconButtonSize.sm) / 2}px;
  position: relative;

  &::after {
    content: '';
    inset: ${(iconButtonSize.sm - iconButtonSize.lg) / 2}px;
    position: absolute;
  }
`

const DesktopModalWrapper = styled.div`
  margin-top: -8px;
`
