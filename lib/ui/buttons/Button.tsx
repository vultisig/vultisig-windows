import { MergeRefs } from '@lib/ui/base/MergeRefs'
import { centerContent } from '@lib/ui/css/centerContent'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { round } from '@lib/ui/css/round'
import { CenterAbsolutely } from '@lib/ui/layout/CenterAbsolutely'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { getHoverVariant } from '@lib/ui/theme/getHoverVariant'
import { getColor } from '@lib/ui/theme/getters'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { match } from '@lib/utils/match'
import React, { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { cropText } from '../css/cropText'
import { UnstyledButton } from './UnstyledButton'

type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl'
type Status = 'default' | 'error' | 'success' | 'warning'
type ButtonType = 'default' | 'link'
type Weight = 400 | 500 | 600 | 700

type ButtonKind =
  | 'primary'
  | 'secondary'
  | 'outlined'
  | 'ghost'
  | 'idle'
  | 'alert'
  | 'default'
  | 'link'

interface ContainerProps {
  size: ButtonSize
  isDisabled?: boolean
  isLoading?: boolean
  isRounded?: boolean
  isBlock?: boolean
  icon?: ReactNode
  kind: ButtonKind
  fitContent?: boolean
  status?: Status
  weight?: Weight
}

const Container = styled(UnstyledButton)<ContainerProps>`
  ${centerContent};
  ${cropText};
  ${round};
  position: relative;
  white-space: nowrap;
  font-weight: 600;
  flex-shrink: 0;

  ${({ isBlock, weight }) => {
    return css`
      align-items: center;
      border: none;
      cursor: pointer;
      display: flex;
      font-weight: ${weight};
      gap: 8px;
      justify-content: center;
      transition: all 0.2s;
      width: ${isBlock ? '100%' : 'auto'};
    `
  }}

  ${({ size, fitContent, isRounded }) =>
    match(size, {
      xs: () => css`
        ${horizontalPadding(8)}
        height: 28px;
        font-size: 12px;
        ${!fitContent && horizontalPadding(8)}
      `,
      s: () => css`
        border-radius: ${isRounded ? '20px' : '4px'};
        font-size: 12px;
        height: 20px;
        min-width: 20px;
        ${!fitContent && horizontalPadding(10)}
      `,
      m: () => css`
        border-radius: ${isRounded ? '24px' : '6px'};
        font-size: 12px;
        height: 24px;
        min-width: 24px;
        ${!fitContent && horizontalPadding(12)}
      `,
      l: () => css`
        border-radius: ${isRounded ? '36px' : '8px'};
        font-size: 14px;
        height: 40px;
        min-width: 40px;
        ${!fitContent && horizontalPadding(16)}
      `,
      xl: () => css`
        border-radius: ${isRounded ? '46px' : '12px'};
        font-size: 14px;
        height: 46px;
        min-width: 46px;
        ${!fitContent && horizontalPadding(16)}
      `,
    })}

  ${({ kind, isDisabled }) =>
    match(kind, {
      default: () => css`
        background-color: ${getColor('buttonBackgroundDisabled')};
        color: ${getColor('textPrimary')};
      `,
      link: () => css`
        background-color: ${getColor('buttonBackgroundDisabled')};
        color: ${getColor('textExtraLight')};
      `,
      primary: () => css`
        background: ${isDisabled
          ? getColor('buttonBackgroundDisabled')
          : getColor('buttonPrimaryWeb')};
        color: ${isDisabled ? getColor('mistExtra') : getColor('textPrimary')};
      `,
      secondary: () => css`
        background: ${isDisabled
          ? getColor('buttonBackgroundDisabled')
          : getColor('backgroundTertiary')};
        color: ${isDisabled ? getColor('mistExtra') : getColor('textPrimary')};
      `,
      outlined: () => css`
        font-weight: 700;
        color: ${getColor('primary')};
        background: ${getColor('foregroundExtra')};
        border: 1px solid ${getColor('primary')};
      `,
      ghost: () => css`
        font-weight: 500;
        color: ${getColor('primary')};
        background: transparent;
      `,
      idle: () => css`
        font-weight: 700;
        color: ${getColor('background')};
        background: ${getColor('idle')};
      `,
      alert: () => css`
        background: ${isDisabled
          ? getColor('buttonBackgroundDisabled')
          : getColor('danger')};
        color: ${isDisabled ? getColor('mistExtra') : getColor('textDark')};
      `,
    })}
  
  ${({ isDisabled, isLoading, kind }) =>
    !isDisabled &&
    !isLoading &&
    css`
      &:hover {
        ${match(kind, {
          default: () => css`
            background: ${getHoverVariant('backgroundTertiary')};
          `,
          link: () => css`
            background: ${getHoverVariant('backgroundTertiary')};
          `,
          primary: () => css`
            background: ${getHoverVariant('buttonPrimaryWebHover')};
          `,
          secondary: () => css`
            background: ${getHoverVariant('buttonPrimaryWeb')};
          `,
          outlined: () => css``,
          ghost: () => css`
            background: ${getColor('mist')};
          `,
          idle: () => css`
            background: ${getHoverVariant('idle')};
          `,
          alert: () => css`
            background: ${({ theme }) =>
              theme.colors.danger
                .getVariant({ l: (l: number) => l * 0.92 })
                .toCssValue()};
          `,
        })}
      }
    `};

  cursor: ${({ isDisabled, isLoading }) =>
    isDisabled ? 'initial' : isLoading ? 'wait' : 'pointer'};

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      opacity: 0.8;
    `};
`

type ButtonProps = Omit<
  React.ComponentProps<typeof Container>,
  'size' | 'kind' | 'isDisabled'
> & {
  size?: ButtonSize
  isDisabled?: boolean | string
  isLoading?: boolean
  isRounded?: boolean
  kind?: ButtonKind
  isBlock?: boolean
  fitContent?: boolean
  onClick?: () => void
  as?: React.ElementType
  status?: 'default' | 'error' | 'success' | 'warning'
  buttonType?: ButtonType
}

const Hide = styled.div`
  opacity: 0;
`

export const Button = ({
  children,
  size = 'l',
  isDisabled = false,
  isLoading = false,
  onClick,
  icon,
  kind = 'primary',
  ref,
  ...rest
}: ButtonProps) => {
  const content = isLoading ? (
    <>
      <Hide>{children}</Hide>
      <CenterAbsolutely>
        <Spinner />
      </CenterAbsolutely>
    </>
  ) : (
    <>
      {icon}
      {children}
    </>
  )

  const containerProps = {
    kind,
    size,
    isDisabled: !!isDisabled,
    isLoading,
    icon,
    onClick: isDisabled || isLoading ? undefined : onClick,
    ...rest,
  }

  if (typeof isDisabled === 'string') {
    return (
      <Tooltip
        content={isDisabled}
        renderOpener={({ ref: tooltipRef, ...rest }) => {
          return (
            <MergeRefs
              refs={[ref, tooltipRef]}
              render={ref => (
                <Container ref={ref} {...rest} {...containerProps}>
                  {content}
                </Container>
              )}
            />
          )
        }}
      />
    )
  }

  return (
    <Container ref={ref} {...containerProps}>
      {content}
    </Container>
  )
}

Button.displayName = 'Button'
