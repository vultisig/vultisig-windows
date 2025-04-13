import { backgroundPrimary, borderLight } from '@clients/extension/src/colors'
import { rem } from '@clients/extension/src/utils/functions'
import { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledAddon = styled.div`
  align-items: center;
  display: flex;
  gap: ${rem(8)};
`

const StyledHeading = styled.h1`
  font-size: ${rem(18)};
  font-weight: 500;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
`

const StyledComponent = styled.div<{ revert: boolean }>`
  align-items: center;
  background-color: ${backgroundPrimary};
  border-bottom: solid ${rem(1)} ${borderLight};
  display: flex;
  flex-direction: row ${({ revert }) => (revert ? '-reverse' : '')};
  min-height: ${rem(60)};
  padding: ${rem(16)} ${rem(24)};
  position: relative;
  width: 100%;
`

interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  addonAfter?: HTMLAttributes<HTMLDivElement>['children']
  addonBefore?: HTMLAttributes<HTMLDivElement>['children']
  heading?: string
  headingProps?: HTMLAttributes<HTMLSpanElement>
}

const Component: FC<ComponentProps> = ({
  addonAfter,
  addonBefore,
  heading,
  headingProps,
  ...rest
}) => {
  return (
    <StyledComponent revert={!addonBefore} {...rest}>
      {addonBefore && <StyledAddon>{addonBefore}</StyledAddon>}
      {heading && <StyledHeading {...headingProps}>{heading}</StyledHeading>}
      {addonAfter && <StyledAddon>{addonAfter}</StyledAddon>}
    </StyledComponent>
  )
}

export default Component
