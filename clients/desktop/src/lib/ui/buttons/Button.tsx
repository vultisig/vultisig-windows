import { match } from '@lib/utils/match'
import React from 'react'
import styled, { css } from 'styled-components'

import { MergeRefs } from '../base/MergeRefs'
import { centerContent } from '../css/centerContent'
import { horizontalPadding } from '../css/horizontalPadding'
import { round } from '../css/round'
import { CenterAbsolutely } from '../layout/CenterAbsolutely'
import { Spinner } from '../loaders/Spinner'
import { getHoverVariant } from '../theme/getHoverVariant'
import { getColor } from '../theme/getters'
import { Tooltip } from '../tooltips/Tooltip'
import { UnstyledButton } from './UnstyledButton'

type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'xl'

type ButtonKind = 'primary' | 'secondary' | 'outlined' | 'ghost' | 'idle'

interface ContainerProps {
  size: ButtonSize
  isDisabled?: boolean
  isLoading?: boolean
  isRounded?: boolean
  kind: ButtonKind
}

const Container = styled(UnstyledButton)<ContainerProps>`
  ${centerContent};
  position: relative;
  white-space: nowrap;
  font-weight: 600;
  flex-shrink: 0;
  ${round};

  ${({ size }) =>
    match(size, {
      xs: () => css`
        ${horizontalPadding(8)}
        height: 28px;
        font-size: 12px;
      `,
      s: () => css`
        ${horizontalPadding(16)}
        height: 36px;
        font-size: 14px;
      `,
      m: () => css`
        ${horizontalPadding(20)}
        height: 40px;
        font-size: 16px;
      `,
      l: () => css`
        ${horizontalPadding(20)}
        height: 48px;
        font-size: 16px;
      `,
      xl: () => css`
        ${horizontalPadding(28)}
        height: 56px;
        font-size: 16px;
      `,
    })}

  ${({ kind, isDisabled }) =>
    match(kind, {
      primary: () => css`
        background: ${isDisabled
          ? getColor('buttonBackgroundDisabled')
          : getColor('primary')};
        color: ${isDisabled ? getColor('mistExtra') : getColor('textDark')};

        &:hover {
          background: ${isDisabled
            ? getColor('buttonBackgroundDisabled')
            : getColor('primary')};
        }
      `,
      secondary: () => css`
        background: ${isDisabled
          ? getColor('buttonBackgroundDisabled')
          : getColor('foregroundExtra')};
        color: ${isDisabled ? getColor('mistExtra') : getColor('contrast')};

        &:hover {
          background: ${isDisabled
            ? getColor('buttonBackgroundDisabled')
            : getColor('foregroundExtra')};
        }
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
    })}
  
  ${({ isDisabled, isLoading, kind }) =>
    !isDisabled &&
    !isLoading &&
    css`
      &:hover {
        ${match(kind, {
          primary: () => css`
            background: ${getHoverVariant('primary')};
          `,
          secondary: () => css`
            background: ${getHoverVariant('foregroundSuperContrast')};
          `,
          outlined: () => css``,
          ghost: () => css`
            background: ${getColor('mist')};
          `,
          idle: () => css`
            background: ${getHoverVariant('idle')};
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
  onClick?: () => void
  as?: React.ElementType
}

const Hide = styled.div`
  opacity: 0;
`

export const Button = ({
  children,
  size = 'm',
  isDisabled = false,
  isLoading = false,
  onClick,
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
    children
  )

  const containerProps = {
    kind,
    size,
    isDisabled: !!isDisabled,
    isLoading,
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
