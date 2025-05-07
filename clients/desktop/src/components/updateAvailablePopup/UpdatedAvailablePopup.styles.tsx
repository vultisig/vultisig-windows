import { Button } from '@lib/ui/buttons/Button'
import { ModalCloseButton } from '@lib/ui/modal/ModalCloseButton'
import styled from 'styled-components'

export const FixedWrapper = styled.div`
  position: fixed;
  inset: 0;
  width: 350px;
  height: 350px;
  margin: auto;
  background-color: ${({ theme }) => theme.colors.background.toCssValue()};
  border: 1px solid ${({ theme }) => theme.colors.contrast.toCssValue()};
  padding: 20px;
  border-radius: 12px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`

export const StyledButton = styled(Button)`
  align-self: stretch;
`

export const StyledModalCloseButton = styled(ModalCloseButton)`
  position: absolute;
  top: 16px;
  right: 16px;
`
