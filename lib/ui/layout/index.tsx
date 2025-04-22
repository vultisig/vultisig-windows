import { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledLayout = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  max-height: 100%;
  overflow: hidden;
`

export const Layout: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
  return <StyledLayout {...props}>{children}</StyledLayout>
}
