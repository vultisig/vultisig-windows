import { pxToRem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledFooter = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundPrimary.toHex()};
  bottom: 0;
  display: flex;
  flex: none;
  gap: ${pxToRem(8)};
  padding: ${pxToRem(16)};
  position: sticky;
  width: 100%;
  z-index: 1;
`

export const Footer: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...rest
}) => {
  return <StyledFooter {...rest}>{children}</StyledFooter>
}
