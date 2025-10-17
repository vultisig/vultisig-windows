import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { match } from '@lib/utils/match'
import { FC } from 'react'
import styled, { css } from 'styled-components'

import { Size } from '../../core/Size'
import { ButtonProps } from '../ButtonProps'

type ButtonSize = Extract<Size, 'xs' | 'sm' | 'md' | 'lg' | 'xl'>

const StyledIconButton = styled(UnstyledButton)<{
  disabled: boolean
  kind: NonNullable<ButtonProps['kind']>
  loading: boolean
  size: ButtonSize
  status: NonNullable<ButtonProps['status']>
}>`
  ${({ disabled, kind, loading, size, status }) => css`
    align-items: center;
    border: none;
    border-radius: ${iconButtonSize[size]}px;
    cursor: pointer;
    display: flex;
    height: ${iconButtonSize[size]}px;
    justify-content: center;
    min-width: ${iconButtonSize[size]}px;
    transition: all 0.2s;
    width: auto;

    ${match(size, {
      xs: () => css`
        font-size: 16px;
      `,
      sm: () => css`
        font-size: 20px;
      `,
      md: () => css`
        font-size: 16px;
      `,
      lg: () => css`
        font-size: 16px;
      `,
      xl: () => css`
        font-size: 20px;
        ${horizontalPadding(32)}
      `,
    })}

    ${disabled || loading
      ? css`
          color: ${getColor('buttonTextDisabled')};
          cursor: default;

          ${match(kind, {
            link: () => css``,
            primary: () => css`
              background-color: ${getColor('buttonBackgroundDisabled')};
            `,
            secondary: () => css`
              background-color: ${getColor('buttonBackgroundDisabled')};
            `,
            action: () => css`
              background-color: ${getColor('buttonBackgroundDisabled')};
            `,
          })}
        `
      : match(kind, {
          link: () => css`
            background-color: transparent;
            color: ${getColor('text')};

            &:hover {
              background-color: ${getColor('buttonLinkHover')};

              ${match(status, {
                default: () => css`
                  color: ${getColor('text')};
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
          `,
          primary: () => css`
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
          `,
          secondary: () => css`
            background-color: ${getColor('foreground')};
            color: ${getColor('text')};

            &:hover {
              background-color: ${getColor('buttonHover')};

              ${match(status, {
                default: () => css`
                  color: ${getColor('text')};
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
          `,
          action: () => css`
            position: relative;
            border-radius: 1000px;
            background:
              linear-gradient(
                0deg,
                rgba(255, 255, 255, 0.06) 0%,
                rgba(255, 255, 255, 0.06) 100%
              ),
              linear-gradient(0deg, #11284a 0%, #11284a 100%),
              rgba(204, 204, 204, 0.5);
            background-blend-mode: normal, normal, color-burn;
            border: 1px solid rgba(255, 255, 255, 0.35);
            color: ${getColor('contrast')};

            box-shadow:
              0 0 2px rgba(255, 255, 255, 0.6),
              0 0 4px rgba(255, 255, 255, 0.4),
              0 0 8px rgba(255, 255, 255, 0.25),
              0 0 16px rgba(255, 255, 255, 0.15),
              inset 0 1px 2px rgba(255, 255, 255, 0.2),
              inset 0 -1px 2px rgba(0, 0, 0, 0.5);

            & > * {
              position: relative;
              z-index: 1;
            }

            &:hover {
              border-color: rgba(255, 255, 255, 0.45);
              box-shadow:
                0 0 2px rgba(255, 255, 255, 0.7),
                0 0 5px rgba(255, 255, 255, 0.5),
                0 0 10px rgba(255, 255, 255, 0.3),
                0 0 20px rgba(255, 255, 255, 0.2),
                inset 0 1px 2px rgba(255, 255, 255, 0.25),
                inset 0 -1px 2px rgba(0, 0, 0, 0.5);
            }
          `,
        })}
  `}
`

export const IconButton: FC<
  Omit<ButtonProps, 'size'> & { size?: ButtonSize }
> = ({
  children,
  disabled,
  kind = 'link',
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
        <StyledIconButton {...options} {...props}>
          {loading ? <Spinner /> : children}
        </StyledIconButton>
      )}
    />
  ) : (
    <StyledIconButton {...props}>
      {loading ? <Spinner /> : children}
    </StyledIconButton>
  )
}

export const iconButtonSize: Record<ButtonSize, number> = {
  xs: 24,
  sm: 28,
  md: 32,
  lg: 40,
  xl: 52,
}
