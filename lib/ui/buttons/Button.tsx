import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Size } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@lib/utils/match'
import { FC, HTMLAttributes, ReactNode } from 'react'
import styled, { css } from 'styled-components'

type ButtonSize = Extract<Size, 'sm' | 'md'>

type HtmlType = 'button' | 'submit' | 'reset'
type Status = 'default' | 'danger' | 'success' | 'warning'
type Type = 'primary' | 'secondary' | 'link'

type ButtonProps = Pick<
  HTMLAttributes<HTMLButtonElement>,
  'children' | 'className' | 'onClick' | 'style' | 'title'
> & {
  disabled?: boolean
  htmlType?: HtmlType
  icon?: ReactNode
  loading?: boolean
  size?: ButtonSize
  status?: Status
  type?: Type
}

const StyledButton = styled.button<{
  btnType: Type
  disabled: boolean
  loading: boolean
  size: ButtonSize
  status: Status
}>`
  ${({ btnType, disabled, loading, size, status }) => css`
    align-items: center;
    border: none;
    cursor: pointer;
    display: flex;
    gap: 8px;
    justify-content: center;
    transition: all 0.2s;
    width: 100%;

    ${disabled || loading
      ? css`
          color: ${getColor('buttonTextDisabled')};
          cursor: default;

          ${match(btnType, {
            link: () => css``,
            primary: () => css`
              background-color: ${getColor('buttonBackgroundDisabled')};
            `,
            secondary: () => css`
              background-color: ${getColor('buttonBackgroundDisabled')};
            `,
          })}
        `
      : match(btnType, {
          link: () => css`
            background-color: transparent;
            color: ${getColor('textPrimary')};

            ${match(size, {
              sm: () => css`
                border-radius: 26px;
                font-size: 14px;
                font-weight: 500;
                height: 26px;
                min-width: 26px;
                ${horizontalPadding(4)}
              `,
              md: () => css`
                border-radius: 28px;
                font-size: 16px;
                font-weight: 500;
                height: 28px;
                min-width: 28px;
                ${horizontalPadding(4)}
              `,
            })}

            &:hover {
              ${match(status, {
                default: () => css`
                  color: ${getColor('buttonPrimaryHover')};
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

            ${match(size, {
              sm: () => css`
                border-radius: 46px;
                font-size: 14px;
                font-weight: 600;
                height: 46px;
                min-width: 46px;
                ${horizontalPadding(24)}
              `,
              md: () => css`
                border-radius: 48px;
                font-size: 16px;
                font-weight: 500;
                height: 48px;
                min-width: 48px;
                ${horizontalPadding(32)}
              `,
            })}

            ${match(status, {
              default: () => css`
                background-color: ${getColor('buttonPrimary')};
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
                  background-color: ${getColor('buttonPrimaryHover')};
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
            background-color: ${getColor('buttonSecondary')};
            color: ${getColor('textPrimary')};

            ${match(size, {
              sm: () => css`
                border-radius: 46px;
                font-size: 14px;
                font-weight: 600;
                height: 46px;
                min-width: 46px;
                ${horizontalPadding(24)}
              `,
              md: () => css`
                border-radius: 48px;
                font-size: 16px;
                font-weight: 500;
                height: 48px;
                min-width: 48px;
                ${horizontalPadding(32)}
              `,
            })}

            &:hover {
              ${match(status, {
                default: () => css`
                  background-color: ${getColor('buttonSecondaryHover')};
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
        })}
  `}
`

export const Button: FC<ButtonProps> = ({
  children,
  disabled = false,
  htmlType,
  icon,
  loading = false,
  size = 'md',
  status = 'default',
  type = 'primary',
  ...props
}) => (
  <StyledButton
    {...props}
    {...{
      btnType: type,
      disabled,
      loading,
      size,
      status,
      type: htmlType,
    }}
  >
    {loading ? <Spinner /> : icon}
    {children}
  </StyledButton>
)
