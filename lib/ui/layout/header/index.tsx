import { pxToRem } from '@lib/utils/pxToRem'
import { FC, HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledAddon = styled.div`
  align-items: center;
  display: flex;
  gap: ${pxToRem(8)};
`

const StyledHeading = styled.h1`
  font-size: ${pxToRem(18)};
  font-weight: 500;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
`

const StyledComponent = styled.div<{ revert: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.backgroundPrimary.toHex()};
  border-bottom: solid ${pxToRem(1)}
    ${({ theme }) => theme.colors.borderLight.toHex()};
  display: flex;
  flex: none;
  flex-direction: ${({ revert }) => (revert ? 'row-reverse' : 'row')};
  min-height: ${pxToRem(60)};
  padding: ${pxToRem(16)} ${pxToRem(24)};
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

export { Component as Header }
