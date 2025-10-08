import { vStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Backdrop } from '@lib/ui/modal/Backdrop'
import { OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useResponsiveness } from '../../providers/ResponsivenessProvider'
import { ShareAppModalContent } from './ShareAppModalContent'

export const ShareAppModal = ({ onClose }: OnCloseProp) => {
  const { isSmall } = useResponsiveness()
  const { t } = useTranslation()

  if (isSmall) {
    return (
      <>
        <Backdrop onClose={onClose} />
        <Wrapper>
          <Text size={15} weight={500} centerHorizontally>
            {t('vultisig')}
          </Text>
          <ShareAppModalContent />
        </Wrapper>
      </>
    )
  }

  return (
    <Modal onClose={onClose} title="Vultisig">
      <DesktopModalWrapper>
        <ShareAppModalContent />
      </DesktopModalWrapper>
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
    gap: 24,
  })};

  padding: 20px;
  border-radius: 16px 16px 0 0;
  background: ${getColor('background')};
`

const DesktopModalWrapper = styled.div`
  margin-top: -8px;
`
