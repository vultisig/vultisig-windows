import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { interactive } from '@lib/ui/css/interactive'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@lib/utils/match'
import { FC, HTMLAttributes, ReactNode } from 'react'
import styled, { css } from 'styled-components'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Status = 'default' | 'danger' | 'success' | 'warning'
type Type = 'default' | 'link' | 'primary' | 'secondary'
type Weight = 400 | 500 | 600 | 700

const StyledButton = styled.button<{
  btnType: Type
  disabled: boolean
  iconOnly: boolean
  size: Size
  status: Status
  weight: Weight
}>`
  ${({ btnType, disabled, iconOnly, size, status, weight }) => css`
    align-items: center;
    border: none;
    cursor: pointer;
    display: flex;
    font-weight: ${weight};
    gap: 8px;
    justify-content: center;
    transition: all 0.2s;
    width: ${iconOnly ? 'auto' : '100%'};

    ${match(size, {
      xs: () => css`
        border-radius: ${iconOnly ? '4px' : '20px'};
        font-size: ${iconOnly ? '16px' : '12px'};
        height: 20px;
        min-width: 20px;
        ${!iconOnly && horizontalPadding(10)}
      `,
      sm: () => css`
        border-radius: ${iconOnly ? '6px' : '24px'};
        font-size: ${iconOnly ? '18px' : '12px'};
        height: 24px;
        min-width: 24px;
        ${!iconOnly && horizontalPadding(12)}
      `,
      md: () => css`
        border-radius: ${iconOnly ? '8px' : '32px'};
        font-size: ${iconOnly ? '20px' : '12px'};
        height: 32px;
        min-width: 32px;
        ${!iconOnly && horizontalPadding(16)}
      `,
      lg: () => css`
        border-radius: ${iconOnly ? '10px' : '36px'};
        font-size: ${iconOnly ? '24px' : '12px'};
        height: 36px;
        min-width: 36px;
        ${!iconOnly && horizontalPadding(16)}
      `,
      xl: () => css`
        border-radius: ${iconOnly ? '12px' : '46px'};
        font-size: ${iconOnly ? '32px' : '14px'};
        height: 46px;
        min-width: 46px;
        ${!iconOnly && horizontalPadding(16)}
      `,
    })}

    ${disabled
      ? css`
          background-color: ${getColor('buttonBackgroundDisabled')};
          color: ${getColor('buttonTextDisabled')};
          cursor: default;
        `
      : match(btnType, {
          default: () => css`
            background-color: transparent;
            color: ${getColor('textPrimary')};

            &:hover {
              background-color: ${getColor('backgroundTertiary')};
              ${match(status, {
                default: () => css`
                  color: ${getColor('textPrimary')};
                `,
                danger: () => css`
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
                danger: () => css`
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
              danger: () => css`
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
                danger: () => css`
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
                danger: () => css`
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
  label?: ReactNode
  loading?: boolean
  size?: Size
  status?: Status
  type?: Type
  weight?: Weight
}

export const Button: FC<ButtonProps> = ({
  disabled = false,
  htmlType,
  icon,
  label,
  loading = false,
  size,
  status = 'default',
  type,
  weight = 500,
  ...props
}) => {
  const iconOnly = !label && !!icon

  return (
    <StyledButton
      {...{
        disabled: disabled || loading,
        btnType: type ? type : iconOnly ? 'default' : 'primary',
        iconOnly,
        size: size ? size : iconOnly ? 'md' : 'xl',
        status,
        type: htmlType,
        weight,
      }}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {label}
    </StyledButton>
  )
}

export const UnstyledButton = styled.button`
  ${interactive};
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-family: inherit;
  line-height: inherit;
`
