import styled, { css } from 'styled-components'

export const RiveWrapper = styled.div<{
  isLastAnimation: boolean
}>`
  ${({ isLastAnimation }) =>
    isLastAnimation &&
    css`
      margin-top: -150px;
      z-index: -1;
    `}
  flex: 1;
`
