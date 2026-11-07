import { IconButton } from '@lib/ui/buttons/IconButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { CloseIcon } from '@lib/ui/icons/CloseIcon'
import { HStack, vStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Backdrop } from '@lib/ui/modal/Backdrop'
import { OnCloseProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { currentProductBrandConfig } from '../../product/brand'
import { useResponsiveness } from '../../providers/ResponsivenessProvider'
import { useCore } from '../../state/core'
import { SettingsBaselineText } from '../SettingsBaselineText'
import { ShareAppModalContent } from './ShareAppModalContent'

const backdropStyle = {
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(6px)',
}

export const ShareAppModal = ({ onClose }: OnCloseProp) => {
  const { isSmall } = useResponsiveness()
  const { client } = useCore()

  if (isSmall) {
    return (
      <Backdrop onClose={onClose} style={backdropStyle}>
        <Wrapper>
          <HStack alignItems="center" justifyContent="space-between">
            <SettingsBaselineText color="shyExtra" variant="subtitle">
              {client === 'extension'
                ? currentProductBrandConfig.extensionName
                : currentProductBrandConfig.name}
            </SettingsBaselineText>
            <CloseButton onClick={onClose} size="xs">
              <CloseIcon />
            </CloseButton>
          </HStack>
          <ShareAppModalContent />
        </Wrapper>
      </Backdrop>
    )
  }

  return (
    <Modal onClose={onClose} title={currentProductBrandConfig.name}>
      <DesktopModalWrapper>
        <ShareAppModalContent />
      </DesktopModalWrapper>
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

  padding: 24px 20px;
  ${borderRadius.lg};
  background: ${getColor('foreground')};
`

// 2px at the 16px render size, on the icon's 24 viewBox; the 24 button keeps its glyph on the frame's 16 slot.
const CloseButton = styled(IconButton)`
  color: ${getColor('textShy')};
  margin: -4px;

  path {
    stroke-width: 3;
  }
`

const DesktopModalWrapper = styled.div`
  margin-top: -8px;
`
