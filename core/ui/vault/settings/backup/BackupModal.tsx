import { IconButton, iconButtonSize } from '@lib/ui/buttons/IconButton'
import { borderRadiusPx } from '@lib/ui/css/borderRadius'
import { CloudIcon } from '@lib/ui/icons/CloudIcon'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { TabletSmartphoneIcon } from '@lib/ui/icons/TabletSmartphoneIcon'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Backdrop } from '@lib/ui/modal/Backdrop'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useResponsiveness } from '../../../providers/ResponsivenessProvider'
import { BackupOption } from './BackupOption'
import { BackupOptionType, backupOptionTypes } from './options'
import { backupOptionView } from './routes'

const backupOptionIcon: Record<BackupOptionType, React.FC> = {
  device: TabletSmartphoneIcon,
  server: CloudIcon,
}

export const BackupModal = ({ onClose }: OnCloseProp) => {
  const navigate = useCoreNavigate()
  const { isSmall } = useResponsiveness()
  const { t } = useTranslation()

  const modalContent = () => (
    <VStack gap={16}>
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
      <Backdrop onClose={onClose}>
        <Wrapper>
          <HStack alignItems="center" justifyContent="space-between" gap={12}>
            <IconButton
              aria-label={t('close')}
              kind="secondary"
              size="lg"
              onClick={onClose}
            >
              <CrossIcon />
            </IconButton>
            <Text
              size={16}
              weight={500}
              color="contrast"
              style={{ flex: 1, textAlign: 'center' }}
            >
              {t('choose_backup_method')}
            </Text>
            <TitleBalance />
          </HStack>
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
  bottom: 0;
  left: 0;
  right: 0;

  ${vStack({
    gap: 20,
  })};

  padding: 20px;
  border-radius: ${borderRadiusPx.xl}px ${borderRadiusPx.xl}px 0 0;
  background: ${getColor('background')};
`

const DesktopModalWrapper = styled.div`
  margin-top: -8px;
`

// Mirrors the close button's width so the title stays centred.
const TitleBalance = styled.div`
  width: ${iconButtonSize.lg}px;
`
