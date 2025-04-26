import { FC, HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

type Placement = 'center' | 'left' | 'right'

const lineCSS = css`
  background-color: ${({ theme }) => theme.colors.borderLight.toHex()};
  height: 1px;
  width: 100%;
`

const StyledText = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary.toHex()};
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`

const StyledDivider = styled.div<{ placement: Placement }>`
  align-items: center;
  display: flex;
  gap: 16px;

  &:after {
    ${lineCSS}
    ${({ placement }) =>
      placement !== 'left'
        ? css`
            content: ' ';
          `
        : css``};
  }

  &:before {
    ${lineCSS}
    ${({ placement }) =>
      placement !== 'right'
        ? css`
            content: ' ';
          `
        : css``};
  }
`

interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement
  text: string
  textProps?: HTMLAttributes<HTMLSpanElement>
}

export const Divider: FC<DividerProps> = ({
  placement = 'center',
  text,
  textProps,
  ...rest
}) => {
  return (
    <StyledDivider placement={placement} {...rest}>
      <StyledText {...textProps}>{text}</StyledText>
    </StyledDivider>
  )
}
