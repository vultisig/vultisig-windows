import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import styled, { css, RuleSet } from 'styled-components'

type Shape = 'default' | 'circle' | 'round'
type Size = 'default' | 'large' | 'small'
type Type = 'default' | 'link' | 'primary'

const baseStyles = css`
  align-items: center;
  background-color: transparent;
  border: none;
  display: flex;
  gap: 8px;
  justify-content: center;
  transition: all 0.2s;
`

const blockStyles = css`
  width: 100%;
`

const disabledStyles: Record<Type, RuleSet> = {
  default: css`
    border: solid 1px ${getColor('buttonTextDisabled')};
    color: ${getColor('buttonTextDisabled')};
  `,
  link: css`
    color: ${getColor('buttonTextDisabled')};
  `,
  primary: css`
    background-color: ${getColor('buttonBackgroundDisabled')};
    color: ${getColor('buttonTextDisabled')};
  `,
}

const shapeStyles: Record<Shape, RuleSet> = {
  circle: css`
    border-radius: 50%;
  `,
  default: css`
    border-radius: 12px;
  `,
  round: css`
    border-radius: 24px;
  `,
}

const sizeStyles: Record<Size, RuleSet> = {
  default: css`
    font-size: 12px;
    font-weight: 500;
    height: 36px;
  `,
  large: css`
    font-size: 14px;
    font-weight: 600;
    height: 46px;
  `,
  small: css`
    font-size: 12px;
    font-weight: 500;
    height: 26px;
  `,
}

const typeStyles: Record<Type, RuleSet> = {
  default: css`
    border: solid 1px ${getColor('buttonPrimaryWeb')};
    color: ${getColor('buttonPrimaryWeb')};
    cursor: pointer;

    &:hover {
      border-color: ${getColor('buttonPrimaryWebHover')};
      color: ${getColor('buttonPrimaryWebHover')};
    }
  `,
  link: css`
    color: ${getColor('textPrimary')};
    cursor: pointer;

    &:hover {
      background-color: ${getColor('backgroundTertiary')};
      color: ${getColor('buttonPrimaryWebHover')};
    }
  `,
  primary: css`
    background-color: ${getColor('buttonPrimaryWeb')};
    color: ${getColor('textPrimary')};
    cursor: pointer;

    &:hover {
      background-color: ${getColor('buttonPrimaryWebHover')};
    }
  `,
}

const StyledButton = styled.button<{
  block?: boolean
  disabled?: boolean
  ghost?: boolean
  shape: Shape
  size: Size
  type: Type
}>`
  ${({ block, disabled, ghost, shape, size, type }) => {
    const blockStyle = block ? blockStyles : ''

    if (ghost) {
      return css`
        ${baseStyles}
        ${blockStyle}
        padding: 0;
      `
    } else {
      const disabledStyle = disabledStyles[type]
      const shapeStyle = shapeStyles[shape]
      const sizeStyle = sizeStyles[size]
      const typeStyle = typeStyles[type]

      return css`
        ${baseStyles}
        ${blockStyle}
        ${shapeStyle}
        ${sizeStyle}
        ${disabled ? disabledStyle : typeStyle}
      `
    }
  }}
`

interface ButtonProps
  extends Pick<
    HTMLAttributes<HTMLButtonElement>,
    'children' | 'onClick' | 'style'
  > {
  block?: boolean
  disabled?: boolean
  ghost?: boolean
  loading?: boolean
  shape?: Shape
  size?: Size
  type?: Type
}

export const Button: FC<ButtonProps> = ({
  children,
  loading,
  shape = 'default',
  size = 'default',
  type = 'default',
  ...props
}) => {
  return (
    <StyledButton {...{ shape, size, type }} {...props}>
      {loading && <Spinner />}
      {children}
    </StyledButton>
  )
}
