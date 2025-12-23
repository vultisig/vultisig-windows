import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import styled from 'styled-components'

export const ModalContent = styled.div`
  ${takeWholeSpace};
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`
