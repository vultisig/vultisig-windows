import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { FC, HTMLAttributes, ReactNode } from 'react'
import styled, { css, RuleSet } from 'styled-components'

type Size = 'xs' | 'sm' | 'md' | 'lg'
type Status = 'default' | 'error' | 'success' | 'warning'
type Type = 'default' | 'link' | 'primary' | 'secondary'
type Weight = 400 | 500 | 600 | 700

const StyledButton = styled.button<{
  block?: boolean
  disabled?: boolean
  fitContent?: boolean
  rounded?: boolean
  size: Size
  status: Status
  type: Type
  weight: Weight
}>`
  ${({ block, disabled, fitContent, rounded, size, status, type, weight }) => {
    const statusColors: Record<Status, RuleSet> = {
      default: css`
        color: ${getColor('textPrimary')};
      `,
      error: css`
        color: ${getColor('alertError')};
      `,
      success: css`
        color: ${getColor('alertSuccess')};
      `,
      warning: css`
        color: ${getColor('alertWarning')};
      `,
    }

    const sizeStyles: Record<Size, RuleSet> = {
      xs: css`
        border-radius: ${rounded ? '20px' : '4px'};
        font-size: 12px;
        height: 20px;
        min-width: 20px;
        ${!fitContent && horizontalPadding(10)}
      `,
      sm: css`
        border-radius: ${rounded ? '24px' : '6px'};
        font-size: 12px;
        height: 24px;
        min-width: 24px;
        ${!fitContent && horizontalPadding(12)}
      `,
      md: css`
        border-radius: ${rounded ? '36px' : '8px'};
        font-size: 12px;
        height: 36px;
        min-width: 36px;
        ${!fitContent && horizontalPadding(16)}
      `,
      lg: css`
        border-radius: ${rounded ? '46px' : '12px'};
        font-size: 14px;
        height: 46px;
        min-width: 46px;
        ${!fitContent && horizontalPadding(16)}
      `,
    }

    const typeStyles: Record<Type, RuleSet> = {
      default: css`
        background-color: transparent;
        color: ${getColor('textPrimary')};

        &:hover {
          background-color: ${getColor('backgroundTertiary')};
          ${statusColors[status]}
        }
      `,
      link: css`
        background-color: transparent;
        color: ${getColor('textExtraLight')};

        &:hover {
          color: ${getColor('textPrimary')};
        }
      `,
      primary: css`
        background-color: ${getColor('buttonPrimaryWeb')};
        color: ${getColor('textPrimary')};

        &:hover {
          background-color: ${getColor('buttonPrimaryWebHover')};
        }
      `,
      secondary: css`
        background-color: ${getColor('backgroundTertiary')};
        color: ${getColor('textPrimary')};

        &:hover {
          color: ${getColor('buttonPrimaryWeb')};
        }
      `,
    }

    return css`
      align-items: center;
      border: none;
      cursor: pointer;
      display: flex;
      font-weight: ${weight};
      gap: 8px;
      justify-content: center;
      transition: all 0.2s;
      width: ${block ? '100%' : 'auto'};
      ${sizeStyles[size]}

      ${disabled
        ? css`
            background-color: ${getColor('buttonBackgroundDisabled')};
            color: ${getColor('buttonTextDisabled')};
            cursor: default;
          `
        : typeStyles[type]}
    `
  }}
`

interface ButtonProps
  extends Pick<
    HTMLAttributes<HTMLButtonElement>,
    'children' | 'onClick' | 'style'
  > {
  block?: boolean
  disabled?: boolean
  fitContent?: boolean
  icon?: ReactNode
  loading?: boolean
  rounded?: boolean
  size?: Size
  status?: Status
  type?: Type
  weight?: Weight
}

export const Button: FC<ButtonProps> = ({
  children,
  icon,
  loading,
  size = 'lg',
  status = 'default',
  type = 'default',
  weight = 500,
  ...props
}) => {
  return (
    <StyledButton {...{ size, status, type, weight }} {...props}>
      {loading ? <Spinner /> : icon}
      {children}
    </StyledButton>
  )
}
