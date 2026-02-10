import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { match } from '@lib/utils/match'
import { FC, ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { Size } from '../../core/Size'
import { ButtonProps, PrimaryButtonStatus } from '../ButtonProps'

type ButtonSize = Extract<Size, 'sm' | 'md'>

const ButtonShadow = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  box-shadow:
    inset 0px -1px 0.5px 0px #0f1c3e,
    inset 0px 1px 1px 0px rgba(255, 255, 255, 0.1);
`

const StyledButton = styled(UnstyledButton)<{
  $disabled: boolean
  $kind: NonNullable<ButtonProps['kind']>
  $loading: boolean
  $size: ButtonSize
  $status: PrimaryButtonStatus
}>`
  ${({ $disabled, $kind, $loading, $size, $status }) => css`
    align-items: center;
    border: none;
    cursor: pointer;
    display: flex;
    gap: 8px;
    justify-content: center;
    transition: all 0.2s;
    width: 100%;
    position: relative;

    ${match($kind, {
      link: () => css`
        ${match($size, {
          sm: () => css`
            border-radius: 26px;
            font-size: 12px;
            font-weight: 500;
            height: 26px;
            min-width: 26px;
            ${horizontalPadding(4)}
          `,
          md: () => css`
            border-radius: 28px;
            font-size: 14px;
            font-weight: 500;
            height: 28px;
            min-width: 28px;
            ${horizontalPadding(4)}
          `,
        })}

        ${$disabled || $loading
          ? css`
              color: ${getColor('buttonTextDisabled')};
              cursor: default;
            `
          : css`
              background-color: transparent;
              color: ${getColor('text')};

              &:hover {
                color: ${getColor('buttonHover')};
              }
            `}
      `,
      primary: () => css`
        ${match($size, {
          sm: () => css`
            border-radius: 36px;
            font-size: 12px;
            font-weight: 500;
            height: 36px;
            min-width: 36px;
            ${horizontalPadding(16)}
          `,
          md: () => css`
            border-radius: 46px;
            font-size: 14px;
            font-weight: 500;
            height: 46px;
            min-width: 46px;
            ${horizontalPadding(24)}
          `,
        })}

        ${$disabled || $loading
          ? css`
              background-color: ${getColor('buttonBackgroundDisabled')};
              color: ${getColor('buttonTextDisabled')};
              cursor: default;
            `
          : css`
              ${match($status, {
                default: () => css`
                  color: ${getColor('text')};
                  background-color: ${getColor('buttonPrimary')};
                `,
                neutral: () => css`
                  color: ${getColor('text')};
                  background-color: ${getColor('buttonNeutral')};
                `,
                danger: () => css`
                  color: ${getColor('text')};
                  background-color: ${getColor('danger')};
                `,
                success: () => css`
                  color: ${getColor('background')};
                  background-color: ${getColor('primary')};
                `,
              })}

              &:hover {
                ${match($status, {
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
            `}
      `,
      outlined: () => css`
        ${match($size, {
          sm: () => css`
            border-radius: 36px;
            font-size: 12px;
            font-weight: 500;
            height: 36px;
            min-width: 36px;
            ${horizontalPadding(16)}
          `,
          md: () => css`
            border-radius: 46px;
            font-size: 14px;
            font-weight: 500;
            height: 46px;
            min-width: 46px;
            ${horizontalPadding(24)}
          `,
        })}

        ${$disabled || $loading
          ? css`
              background-color: ${getColor('buttonBackgroundDisabled')};
              border: 1px solid ${getColor('buttonBackgroundDisabled')};
              color: ${getColor('buttonTextDisabled')};
              cursor: default;
            `
          : css`
              background-color: transparent;
              border: 1px solid ${getColor('buttonPrimary')};

              &:hover {
                background-color: ${getColor('buttonPrimary')};
                color: ${getColor('text')};
              }
            `}
      `,
      secondary: () => css`
        ${match($size, {
          sm: () => css`
            border-radius: 36px;
            font-size: 12px;
            font-weight: 500;
            height: 36px;
            min-width: 36px;
            ${horizontalPadding(16)}
          `,
          md: () => css`
            border-radius: 46px;
            font-size: 14px;
            font-weight: 500;
            height: 46px;
            min-width: 46px;
            ${horizontalPadding(24)}
          `,
        })}

        ${$disabled || $loading
          ? css`
              background-color: ${getColor('buttonBackgroundDisabled')};
              color: ${getColor('buttonTextDisabled')};
              cursor: default;
            `
          : css`
              background-color: ${getColor('buttonSecondary')};
              border: 1px solid rgba(255, 255, 255, 0.03);
              color: ${getColor('text')};

              &:hover {
                background-color: ${getColor('buttonSecondaryHover')};
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
  const styledProps = {
    $disabled: !!disabled,
    $kind: kind,
    $loading: loading,
    $size: size,
    $status: status as PrimaryButtonStatus,
  }

  const htmlProps = {
    disabled: !!disabled,
    ...rest,
  }

  const showShadow = kind === 'primary' && !disabled && !loading

  return typeof disabled === 'string' ? (
    <Tooltip
      content={disabled}
      renderOpener={options => (
        <StyledButton {...options} {...htmlProps} {...styledProps}>
          {loading ? <Spinner /> : icon}
          {children}
          {showShadow && <ButtonShadow />}
        </StyledButton>
      )}
    />
  ) : (
    <StyledButton {...htmlProps} {...styledProps}>
      {loading ? <Spinner /> : icon}
      {children}
      {showShadow && <ButtonShadow />}
    </StyledButton>
  )
}

export const buttonSize: Record<ButtonSize, number> = {
  sm: 26,
  md: 28,
}

export const buttonHeight: Record<ButtonSize, number> = {
  sm: 36,
  md: 46,
}
