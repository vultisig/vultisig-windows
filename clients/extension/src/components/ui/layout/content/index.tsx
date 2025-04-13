import { rem } from '@clients/extension/src/utils/functions'
import { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledComponent = styled.div`
  flex-grow: 1;
  overflow-x: hidden;
  padding: ${rem(24)};
  position: relative;
  width: 100%;
`

const Component: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...rest
}) => {
  return <StyledComponent {...rest}>{children}</StyledComponent>
}

export default Component
