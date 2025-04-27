import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes } from 'react'
import styled, { css, RuleSet } from 'styled-components'

type Shape = 'default' | 'circle' | 'round'
type Size = 'default' | 'large' | 'small'
type Type = 'default' | 'primary' | 'secondary'

const baseStyles: RuleSet = css`
  align-items: center;
  background-color: transparent;
  border: none;
  color: ${getColor('textExtraLight')};
  cursor: pointer;
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 8px;
  justify-content: center;
  transition: all 0.2s;
`

const blockStyles: RuleSet = css`
  width: 100%;
`

const disabledStyles: RuleSet = css`
  background-color: ${getColor('buttonBackgroundDisabled')};
  color: ${getColor('buttonTextDisabled')};
  cursor: default;
  padding: 0 16px;
`

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
    height: 36px;
  `,
  large: css`
    font-size: 14px;
    height: 46px;
  `,
  small: css`
    height: 26px;
  `,
}

const typeStyles: Record<Type, RuleSet> = {
  default: css`
    border: solid 1px ${getColor('buttonPrimaryWeb')};
    color: ${getColor('buttonPrimaryWeb')};
    padding: 0 16px;

    &:hover {
      border-color: ${getColor('buttonPrimaryWebHover')};
      color: ${getColor('buttonPrimaryWebHover')};
    }
  `,
  primary: css`
    background-color: ${getColor('buttonPrimaryWeb')};
    color: ${getColor('textPrimary')};
    padding: 0 16px;

    &:hover {
      background-color: ${getColor('buttonPrimaryWebHover')};
    }
  `,
  secondary: css`
    background-color: ${getColor('backgroundTertiary')};
    color: ${getColor('textPrimary')};
    padding: 0 16px;

    &:hover {
      color: ${getColor('buttonPrimaryWeb')};
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
    if (ghost) {
      return baseStyles
    } else {
      const shapeStyle = shapeStyles[shape]
      const sizeStyle = sizeStyles[size]
      const typeStyle = typeStyles[type]

      return css`
        ${baseStyles}
        ${shapeStyle}
        ${sizeStyle}
        ${disabled ? disabledStyles : typeStyle}
        ${block ? blockStyles : ''}
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
