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

import { UnstyledButton } from '../button'
import { cropText } from '../css/cropText'
import { HStack } from '../layout/Stack'

type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl'

type ButtonKind =
  | 'primary'
  | 'secondary'
  | 'outlined'
  | 'ghost'
  | 'idle'
  | 'alert'
  | 'accent'

interface ContainerProps {
  size: ButtonSize
  isDisabled?: boolean
  isLoading?: boolean
  icon?: ReactNode
  kind: ButtonKind
}

const Container = styled(UnstyledButton)<ContainerProps>`
  ${centerContent};
  ${cropText};
  ${round};
  position: relative;
  white-space: nowrap;
  font-weight: 600;
  flex-shrink: 0;
  ${horizontalPadding(16)}

  ${({ size }) =>
    match(size, {
      xs: () => css`
        ${horizontalPadding(8)}
        height: 28px;
        font-size: 12px;
      `,
      s: () => css`
        border-radius: 20px;
        font-size: 12px;
        height: 20px;
        min-width: 20px;
      `,
      m: () => css`
        border-radius: 24px;
        font-size: 12px;
        height: 24px;
        min-width: 24px;
      `,
      l: () => css`
        border-radius: 36px;
        font-size: 14px;
        height: 40px;
        min-width: 40px;
      `,
      xl: () => css`
        border-radius: 46px;
        font-size: 14px;
        height: 46px;
        min-width: 46px;
      `,
    })}

  ${({ kind, isDisabled }) =>
    match(kind, {
      primary: () => css`
        background: ${isDisabled
          ? getColor('buttonBackgroundDisabled')
          : getColor('buttonPrimary')};
        color: ${isDisabled ? getColor('mistExtra') : getColor('textPrimary')};
      `,
      accent: () => css`
        background: ${isDisabled
          ? getColor('buttonPrimary')
          : getColor('buttonPrimary')};
        color: ${isDisabled ? getColor('contrast') : getColor('contrast')};
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
          primary: () => css`
            background: ${getColor('buttonPrimaryHover')};
          `,
          accent: () => css`
            background: ${getColor('buttonPrimaryHover')};
          `,
          secondary: () => css`
            background: ${getColor('buttonPrimary')};
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
  kind?: ButtonKind
  onClick?: () => void
  as?: React.ElementType
}

const Hide = styled.div`
  opacity: 0;
  gap: 8px;
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
  const innerContent = icon ? (
    <HStack gap={8} alignItems="center">
      {icon}
      {children}
    </HStack>
  ) : (
    children
  )

  const content = isLoading ? (
    <>
      <Hide>{innerContent}</Hide>
      <CenterAbsolutely>
        <Spinner />
      </CenterAbsolutely>
    </>
  ) : (
    innerContent
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
