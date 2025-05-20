import { VStack } from '@lib/ui/layout/Stack'
import styled, { css } from 'styled-components'

export const RiveWrapper = styled(VStack)<{
  isLastAnimation: boolean
}>`
  ${({ isLastAnimation }) =>
    isLastAnimation &&
    css`
      margin-top: -150px;
      z-index: -1;
    `}
  flex: 1;
  position: relative;
`
