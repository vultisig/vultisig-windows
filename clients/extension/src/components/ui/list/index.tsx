import { textExtraLight } from '@clients/extension/src/colors'
import { rem } from '@clients/extension/src/utils/functions'
import { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledHeading = styled.h2`
  color: ${textExtraLight};
  font-size: ${rem(12)};
  font-weight: 500;
  line-height: ${rem(16)};
  white-space: nowrap;
`

const StyledComponent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${rem(12)};
`

interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  heading?: string
  headingProps?: HTMLAttributes<HTMLSpanElement>
}

const Component: FC<ComponentProps> = ({ heading, headingProps, ...rest }) => {
  return (
    <StyledComponent {...rest}>
      {heading && <StyledHeading {...headingProps}>{heading}</StyledHeading>}
    </StyledComponent>
  )
}

export default Component
