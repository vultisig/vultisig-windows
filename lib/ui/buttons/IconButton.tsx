import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { ButtonProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { match } from '@lib/utils/match'
import { FC } from 'react'
import styled, { css } from 'styled-components'

type ButtonSize = Extract<ButtonProps['size'], 'xs' | 'sm' | 'md' | 'lg' | 'xl'>

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
    cursor: pointer;
    display: flex;
    justify-content: center;
    transition: all 0.2s;
    width: auto;

    ${match(size, {
      xs: () => css`
        border-radius: 24px;
        font-size: 16px;
        height: 24px;
        min-width: 24px;
      `,
      sm: () => css`
        border-radius: 28px;
        font-size: 20px;
        height: 28px;
        min-width: 28px;
      `,
      md: () => css`
        border-radius: 32px;
        font-size: 16px;
        height: 32px;
        min-width: 32px;
      `,
      lg: () => css`
        border-radius: 40px;
        font-size: 16px;
        height: 40px;
        min-width: 40px;
      `,
      xl: () => css`
        border-radius: 52px;
        font-size: 20px;
        height: 52px;
        min-width: 52px;
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
          })}
        `
      : match(kind, {
          link: () => css`
            background-color: transparent;
            color: ${getColor('textPrimary')};

            &:hover {
              background-color: ${getColor('buttonLinkHover')};

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

            &:hover {
              background-color: ${getColor('buttonSecondaryHover')};

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

export const iconButtonSizeRecord = { s: 24, m: 32, l: 40 }

export const iconButtonIconSizeRecord = { s: 14, m: 16, l: 18 }
