import { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledComponent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  max-height: 100%;
  overflow: hidden;
`

const Component: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...props
}) => {
  return <StyledComponent {...props}>{children}</StyledComponent>
}

export { Component as Layout }
