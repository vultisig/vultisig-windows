import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { match } from '@vultisig/lib-utils/match'
import { FC, ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { Size } from '../../core/Size'
import { ButtonProps, PrimaryButtonStatus } from '../ButtonProps'

// `xs` is the design system's "Mini" size.
type ButtonSize = Extract<Size, 'xs' | 'sm' | 'md'>

// Only a resting default-hierarchy primary sits proud. Every other filled
// state — the other hierarchies, hover, disabled, and all of secondary —
// drops to the flatter inset pair.
const raisedInset = css`
  box-shadow:
    inset 0 1px 1.9px 0 rgba(255, 255, 255, 0.24),
    inset 0 -1px 1.6px 0 rgba(15, 28, 62, 0.48);
`

const flatInset = css`
  box-shadow:
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0.5px 0 rgba(15, 28, 62, 1);
`

const restingInset: Record<PrimaryButtonStatus, typeof flatInset> = {
  default: raisedInset,
  danger: raisedInset,
  neutral: flatInset,
  success: flatInset,
}

const hairlineBorder = css`
  border: 1px solid rgba(255, 255, 255, 0.03);
`

const pillHeight = (value: number) => css`
  height: ${value}px;
  min-height: ${value}px;
  min-width: ${value}px;
`

// The design system gives the neutral and success hierarchies 12px of vertical
// padding against the default hierarchy's 14px, so they sit 4px shorter at md.
// xs and sm are one height for every hierarchy.
const mediumHeight: Record<PrimaryButtonStatus, number> = {
  default: 46,
  danger: 46,
  neutral: 42,
  success: 42,
}

const pillMetrics = (size: ButtonSize, status: PrimaryButtonStatus) =>
  match(size, {
    xs: () => css`
      border-radius: 30px;
      font-size: 12px;
      gap: 4px;
      line-height: 16px;
      width: fit-content;
      ${pillHeight(32)}
      ${horizontalPadding(16)}
    `,
    sm: () => css`
      font-size: 12px;
      gap: 4px;
      line-height: 16px;
      ${pillHeight(36)}
      ${horizontalPadding(16)}
    `,
    md: () => css`
      font-size: 14px;
      gap: 8px;
      line-height: 18px;
      ${pillHeight(mediumHeight[status])}
      ${horizontalPadding(24)}
    `,
  })

// The link kind is one size in the design system — both `sm` and `md` render
// the same 26px pill.
const linkMetrics = css`
  font-size: 14px;
  gap: 8px;
  height: 26px;
  line-height: 18px;
  min-height: 26px;
  min-width: 26px;
  ${horizontalPadding(4)}
`

const StyledButton = styled(UnstyledButton)<{
  $disabled: boolean
  $kind: NonNullable<ButtonProps['kind']>
  $loading: boolean
  $size: ButtonSize
  $status: PrimaryButtonStatus
}>`
  ${({ $disabled, $kind, $loading, $size, $status, theme }) => css`
    align-items: center;
    border: none;
    border-radius: 99px;
    cursor: pointer;
    display: flex;
    font-weight: 500;
    justify-content: center;
    position: relative;
    transition: all 0.2s;
    width: 100%;

    ${match($kind, {
      link: () => css`
        ${linkMetrics}

        ${$disabled || $loading
          ? css`
              color: ${getColor('buttonTextDisabled')};
              cursor: default;
            `
          : css`
              background-color: transparent;
              color: ${getColor('text')};

              &:hover {
                background-color: ${getColor('buttonLinkHover')};
              }
            `}
      `,
      primary: () => css`
        ${pillMetrics($size, $status)}

        ${$disabled || $loading
          ? css`
              ${flatInset}
              background-color: ${getColor('buttonBackgroundDisabled')};
              color: ${getColor('buttonTextDisabled')};
              cursor: default;
            `
          : css`
              ${restingInset[$status]}

              /* Only the md pill carries a hairline, and success never does */
              ${$size === 'md' && $status !== 'success' ? hairlineBorder : ''}

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
                ${flatInset}

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
                    background-color: ${getColor('buttonSuccessHover')};
                  `,
                })}
              }
            `}
      `,
      outlined: () => css`
        ${pillMetrics($size, $status)}

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
        ${pillMetrics($size, $status)}
        ${flatInset}

        ${$disabled || $loading
          ? css`
              background-color: transparent;
              border: 1px solid
                ${theme.colors.buttonNeutral
                  .getVariant({ a: () => 0.6 })
                  .toCssValue()};
              color: ${getColor('buttonTextDisabled')};
              cursor: default;
            `
          : css`
              ${hairlineBorder}
              background-color: ${getColor('buttonSecondary')};
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

  return typeof disabled === 'string' ? (
    <Tooltip
      content={disabled}
      renderOpener={options => (
        <StyledButton {...options} {...htmlProps} {...styledProps}>
          {loading ? <Spinner /> : icon}
          {children}
        </StyledButton>
      )}
    />
  ) : (
    <StyledButton {...htmlProps} {...styledProps}>
      {loading ? <Spinner /> : icon}
      {children}
    </StyledButton>
  )
}

export const buttonSize: Record<ButtonSize, number> = {
  xs: 26,
  sm: 26,
  md: 26,
}

export const buttonHeight: Record<ButtonSize, number> = {
  xs: 32,
  sm: 36,
  md: 46,
}
