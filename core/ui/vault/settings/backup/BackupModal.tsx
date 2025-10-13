import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { CloudIcon } from '@lib/ui/icons/CloudIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
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
          >
            {t(`${option}_backup_description`)}
          </BackupOption>
        )
      })}
    </VStack>
  )

  if (isSmall) {
    return (
      <>
        <Backdrop onClose={onClose} />
        <Wrapper>
          <VStack gap={26}>
            <HStack justifyContent="space-between">
              <CancelButton onClick={onClose}>
                <IconWrapper size={44} color="textSupporting">
                  <CloseIcon />
                </IconWrapper>
              </CancelButton>
            </HStack>
            <Text size={22} weight={500}>
              {t('choose_backup_method')}
            </Text>
          </VStack>
          {modalContent()}
        </Wrapper>
      </>
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
  z-index: 1;

  ${vStack({
    gap: 16,
  })};

  padding: 20px;
  border-radius: 16px 16px 0 0;
  background: ${getColor('background')};
`

const DesktopModalWrapper = styled.div`
  margin-top: -8px;
`

const ActionButton = styled(UnstyledButton)`
  width: 44px;
  height: 44px;
  border-radius: 50%;
`

const CancelButton = styled(ActionButton)`
  fill: var(--Fills-Secondary, rgba(120, 120, 128, 0.32));
  mix-blend-mode: plus-lighter;

  &:hover {
    color: ${getColor('contrast')};
  }
`
