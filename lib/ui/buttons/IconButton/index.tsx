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
  status: any
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
            outlined: () => css`
              background-color: ${getColor('buttonBackgroundDisabled')};
              border: 1px solid ${getColor('buttonBackgroundDisabled')};
            `,
          })}
        `
      : match(kind, {
          link: () => css`
            background-color: transparent;
            color: ${getColor('text')};

            &:hover {
              background-color: ${getColor('buttonLinkHover')};

              ${kind === 'primary'
                ? match(status, {
                    default: () => css`
                      color: ${getColor('text')};
                    `,
                    neutral: () => css`
                      color: ${getColor('text')};
                    `,
                    danger: () => css`
                      color: ${getColor('danger')};
                    `,
                    success: () => css`
                      color: ${getColor('primary')};
                    `,
                  })
                : css`
                    color: ${getColor('text')};
                  `}
            }
          `,
          primary: () => css`
            color: ${getColor('text')};

            ${match(status, {
              default: () => css`
                background-color: ${getColor('buttonPrimary')};
              `,
              neutral: () => css`
                background-color: ${getColor('buttonNeutral')};
              `,
              danger: () => css`
                background-color: ${getColor('danger')};
              `,
              success: () => css`
                background-color: ${getColor('primary')};
              `,
            })}

            &:hover {
              ${match(status, {
                default: () => css`
                  background-color: ${getColor('buttonHover')};
                `,
                neutral: () => css`
                  background-color: ${getColor('buttonNeutralHover')};
                `,
                danger: () => css`
                  background-color: ${getColor('danger')};
                `,
                success: () => css`
                  background-color: ${getColor('primary')};
                `,
              })}
            }
          `,
          secondary: () => css`
            background-color: ${getColor('buttonSecondary')};
            border: 1px solid rgba(255, 255, 255, 0.03);
            color: ${getColor('text')};

            &:hover {
              background-color: ${getColor('buttonSecondaryHover')};
            }
          `,
          outlined: () => css`
            background-color: transparent;
            border: 1px solid ${getColor('buttonPrimary')};
            color: ${getColor('buttonPrimary')};

            &:hover {
              background-color: ${getColor('buttonPrimary')};
              color: ${getColor('text')};
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
