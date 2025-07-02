import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { match } from '@lib/utils/match'
import { FC, ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { Size } from '../../core/Size'
import { ButtonProps } from '../ButtonProps'

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
              color: ${getColor('text')};

              &:hover {
                ${match(status, {
                  default: () => css`
                    color: ${getColor('buttonHover')};
                  `,
                  danger: () => css`
                    color: ${getColor('danger')};
                  `,
                  success: () => css`
                    color: ${getColor('primary')};
                  `,
                  warning: () => css`
                    color: ${getColor('idle')};
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
              color: ${getColor('text')};

              ${match(status, {
                default: () => css`
                  background-color: ${getColor('buttonPrimary')};
                `,
                danger: () => css`
                  background-color: ${getColor('danger')};
                `,
                success: () => css`
                  background-color: ${getColor('primary')};
                `,
                warning: () => css`
                  background-color: ${getColor('idle')};
                `,
              })}

              &:hover {
                ${match(status, {
                  default: () => css`
                    background-color: ${getColor('buttonHover')};
                  `,
                  danger: () => css`
                    background-color: ${getColor('danger')};
                  `,
                  success: () => css`
                    background-color: ${getColor('primary')};
                  `,
                  warning: () => css`
                    background-color: ${getColor('idle')};
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
              background-color: ${getColor('foreground')};
              color: ${getColor('text')};

              &:hover {
                ${match(status, {
                  default: () => css`
                    background-color: ${getColor('buttonHover')};
                  `,
                  danger: () => css`
                    background-color: ${getColor('danger')};
                  `,
                  success: () => css`
                    background-color: ${getColor('primary')};
                  `,
                  warning: () => css`
                    background-color: ${getColor('idle')};
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

export const buttonSize: Record<ButtonSize, number> = {
  sm: 26,
  md: 28,
}
