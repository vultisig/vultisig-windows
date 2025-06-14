import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ButtonProps, Size } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { match } from '@lib/utils/match'
import { FC, ReactNode } from 'react'
import styled, { css } from 'styled-components'

type ButtonSize = Extract<Size, 'sm' | 'md'>

const StyledButton = styled(UnstyledButton)<{
  disabled: boolean
  kind: NonNullable<ButtonProps['kind']>
  loading: boolean
  size: ButtonSize
  status: NonNullable<ButtonProps['status']>
}>`
  ${({ disabled, kind, loading, size, status }) => css`
    align-items: center;
    border: none;
    cursor: pointer;
    display: flex;
    gap: 8px;
    justify-content: center;
    transition: all 0.2s;
    width: 100%;

    ${match(kind, {
      link: () => css`
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

        ${disabled || loading
          ? css`
              color: ${getColor('buttonTextDisabled')};
              cursor: default;
            `
          : css`
              background-color: transparent;
              color: ${getColor('textPrimary')};

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
            `}
      `,
      primary: () => css`
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

        ${disabled || loading
          ? css`
              background-color: ${getColor('buttonBackgroundDisabled')};
              color: ${getColor('buttonTextDisabled')};
              cursor: default;
            `
          : css`
              color: ${getColor('textPrimary')};

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
            `}
      `,
      secondary: () => css`
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

        ${disabled || loading
          ? css`
              background-color: ${getColor('buttonBackgroundDisabled')};
              color: ${getColor('buttonTextDisabled')};
              cursor: default;
            `
          : css`
              background-color: ${getColor('buttonSecondary')};
              color: ${getColor('textPrimary')};

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
            `}
      `,
    })}
  `}
`

export const Button: FC<
  ButtonProps & { icon?: ReactNode; size?: ButtonSize }
> = ({
  children,
  disabled,
  icon,
  kind = 'primary',
  loading = false,
  size = 'md',
  status = 'default',
  ...rest
}) => {
  const props = {
    disabled: !!disabled,
    kind,
    loading,
    size,
    status,
    ...rest,
  }

  return typeof disabled === 'string' ? (
    <Tooltip
      content={disabled}
      renderOpener={options => (
        <StyledButton {...options} {...props}>
          {loading ? <Spinner /> : icon}
          {children}
        </StyledButton>
      )}
    />
  ) : (
    <StyledButton {...props}>
      {loading ? <Spinner /> : icon}
      {children}
    </StyledButton>
  )
}
