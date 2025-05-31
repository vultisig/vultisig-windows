import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@lib/utils/match'
import { FC, HTMLAttributes, ReactNode } from 'react'
import styled, { css } from 'styled-components'

type Kind = 'default' | 'link' | 'primary' | 'secondary'
type Size = 'xs' | 'sm' | 'md' | 'lg'
type Status = 'default' | 'error' | 'success' | 'warning'
type Weight = 400 | 500 | 600 | 700

const StyledButton = styled.button<{
  disabled?: boolean
  iconBtn: boolean
  size: Size
  status: Status
  kind: Kind
  weight: Weight
}>`
  ${({ disabled, iconBtn, kind, size, status, weight }) => css`
    align-items: center;
    border: none;
    cursor: pointer;
    display: flex;
    font-weight: ${weight};
    gap: 8px;
    justify-content: center;
    transition: all 0.2s;
    width: ${iconBtn ? 'auto' : '100%'};

    ${match(size, {
      xs: () => css`
        border-radius: ${iconBtn ? '4px' : '20px'};
        font-size: 12px;
        height: 20px;
        min-width: 20px;
        ${!iconBtn && horizontalPadding(10)}
      `,
      sm: () => css`
        border-radius: ${iconBtn ? '6px' : '24px'};
        font-size: 12px;
        height: 24px;
        min-width: 24px;
        ${!iconBtn && horizontalPadding(12)}
      `,
      md: () => css`
        border-radius: ${iconBtn ? '8px' : '36px'};
        font-size: 12px;
        height: 36px;
        min-width: 36px;
        ${!iconBtn && horizontalPadding(16)}
      `,
      lg: () => css`
        border-radius: ${iconBtn ? '12px' : '46px'};
        font-size: 14px;
        height: 46px;
        min-width: 46px;
        ${!iconBtn && horizontalPadding(16)}
      `,
    })}

    ${disabled
      ? css`
          background-color: ${getColor('buttonBackgroundDisabled')};
          color: ${getColor('buttonTextDisabled')};
          cursor: default;
        `
      : match(kind, {
          default: () => css`
            background-color: transparent;
            color: ${getColor('textPrimary')};

            &:hover {
              background-color: ${getColor('backgroundTertiary')};
              ${match(status, {
                default: () => css`
                  color: ${getColor('textPrimary')};
                `,
                error: () => css`
                  color: ${getColor('alertError')};
                `,
                success: () => css`
                  color: ${getColor('alertSuccess')};
                `,
                warning: () => css`
                  color: ${getColor('alertWarning')};
                `,
              })}
            }
          `,
          link: () => css`
            background-color: transparent;
            color: ${getColor('textExtraLight')};

            &:hover {
              ${match(status, {
                default: () => css`
                  color: ${getColor('textPrimary')};
                `,
                error: () => css`
                  color: ${getColor('alertError')};
                `,
                success: () => css`
                  color: ${getColor('alertSuccess')};
                `,
                warning: () => css`
                  color: ${getColor('alertWarning')};
                `,
              })}
            }
          `,
          primary: () => css`
            color: ${getColor('textPrimary')};

            ${match(status, {
              default: () => css`
                background-color: ${getColor('buttonPrimaryWeb')};
              `,
              error: () => css`
                background-color: ${getColor('alertError')};
              `,
              success: () => css`
                background-color: ${getColor('alertSuccess')};
              `,
              warning: () => css`
                background-color: ${getColor('alertWarning')};
              `,
            })}

            &:hover {
              ${match(status, {
                default: () => css`
                  background-color: ${getColor('buttonPrimaryWebHover')};
                `,
                error: () => css`
                  background-color: ${getColor('alertError')};
                `,
                success: () => css`
                  background-color: ${getColor('alertSuccess')};
                `,
                warning: () => css`
                  background-color: ${getColor('alertWarning')};
                `,
              })}
            }
          `,
          secondary: () => css`
            background-color: ${getColor('backgroundTertiary')};
            color: ${getColor('textPrimary')};

            &:hover {
              ${match(status, {
                default: () => css`
                  color: ${getColor('buttonPrimaryWeb')};
                `,
                error: () => css`
                  color: ${getColor('alertError')};
                `,
                success: () => css`
                  color: ${getColor('alertSuccess')};
                `,
                warning: () => css`
                  color: ${getColor('alertWarning')};
                `,
              })}
            }
          `,
        })}
  `}
`

interface ButtonProps
  extends Pick<
    HTMLAttributes<HTMLButtonElement>,
    'className' | 'onClick' | 'onClickCapture' | 'style' | 'title'
  > {
  disabled?: boolean
  htmlType?: 'button' | 'submit' | 'reset'
  icon?: ReactNode
  kind?: Kind
  label?: ReactNode
  loading?: boolean
  size?: Size
  status?: Status
  weight?: Weight
}

export const Button: FC<ButtonProps> = ({
  htmlType,
  icon,
  kind = 'default',
  label,
  loading,
  size = 'lg',
  status = 'default',
  weight = 500,
  ...props
}) => {
  return (
    <StyledButton
      {...{ iconBtn: !label, kind, size, status, weight }}
      {...props}
      type={htmlType}
    >
      {loading ? <Spinner /> : icon}
      {label}
    </StyledButton>
  )
}
