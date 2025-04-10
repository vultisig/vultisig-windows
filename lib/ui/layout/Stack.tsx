import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import React from 'react'
import styled, { css } from 'styled-components'

type FixedDirectionStackProps = {
  gap?: React.CSSProperties['gap']
  alignItems?: React.CSSProperties['alignItems']
  justifyContent?: React.CSSProperties['justifyContent']
  wrap?: React.CSSProperties['flexWrap']
  fullWidth?: boolean
  fullHeight?: boolean
  fullSize?: boolean
  flexGrow?: boolean
  children?: React.ReactNode
  scrollable?: boolean
}

type StackProps = FixedDirectionStackProps & {
  direction: React.CSSProperties['flexDirection']
}

const formatFlexAlignment = (
  value:
    | React.CSSProperties['alignItems']
    | React.CSSProperties['justifyContent']
) => {
  if (value === 'end' || value === 'start') {
    return `flex-${value}`
  }

  return value
}

const stack = ({
  gap,
  alignItems,
  justifyContent,
  wrap,
  fullWidth,
  fullHeight,
  fullSize,
  direction,
  flexGrow,
  scrollable,
}: StackProps) => css`
  display: flex;
  flex-direction: ${direction};
  ${gap &&
  css`
    gap: ${toSizeUnit(gap)};
  `}
  ${alignItems &&
  css`
    align-items: ${formatFlexAlignment(alignItems)};
  `}
  ${justifyContent &&
  css`
    justify-content: ${formatFlexAlignment(justifyContent)};
  `}
  ${wrap &&
  css`
    flex-wrap: ${wrap};
  `}
  ${fullWidth &&
  css`
    width: 100%;
  `}
  ${fullHeight &&
  css`
    height: 100%;
  `}
  ${fullSize &&
  css`
    width: 100%;
    height: 100%;
  `}
    ${flexGrow &&
  css`
    flex: 1;
  `}
  ${scrollable &&
  css`
    overflow: auto;
    flex-basis: 0;
    > * {
      flex-shrink: 0;
    }
  `}
`

export const vStack = (props: FixedDirectionStackProps = {}) =>
  stack({ ...props, direction: 'column' })

export const hStack = (props: FixedDirectionStackProps = {}) =>
  stack({ ...props, direction: 'row' })

export const VStack = styled.div<FixedDirectionStackProps>`
  ${vStack}
`

export const HStack = styled.div<FixedDirectionStackProps>`
  ${hStack}
`
