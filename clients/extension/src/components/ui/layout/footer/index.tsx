import { backgroundPrimary } from '@clients/extension/src/colors'
import { rem } from '@clients/extension/src/utils/functions'
import { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledComponent = styled.div`
  align-items: center;
  background-color: ${backgroundPrimary};
  display: flex;
  gap: ${rem(8)};
  padding: ${rem(24)};
  position: sticky;
  width: 100%;
  z-index: 1;
`

const Component: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  ...rest
}) => {
  return <StyledComponent {...rest}>{children}</StyledComponent>
}

export default Component
