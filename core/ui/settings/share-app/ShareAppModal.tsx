import { Modal } from '@lib/ui/modal'
import { Backdrop } from '@lib/ui/modal/Backdrop'
import { OnCloseProp } from '@lib/ui/props'
import styled from 'styled-components'

import { useResponsiveness } from '../../providers/ResponsivenessProvider'
import { ShareAppModalContent } from './ShareAppModalContent'

export const ShareAppModal = ({ onClose }: OnCloseProp) => {
  const { isSmall } = useResponsiveness()

  if (isSmall) {
    return (
      <>
        <Backdrop onClose={onClose} />
        <Wrapper>
          <ShareAppModalContent />
        </Wrapper>
      </>
    )
  }

  return (
    <Modal onClose={onClose} title="Vultisig">
      <ShareAppModalContent />
    </Modal>
  )
}

const Wrapper = styled.div`
  position: fixed;
`
