import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColors } from '@lib/ui/theme/ThemeColors'
import { CSSProperties, ReactNode } from 'react'
import styled, { css } from 'styled-components'

type FixedDirectionStackProps = {
  alignItems?: CSSProperties['alignItems']
  alignSelf?: CSSProperties['alignSelf']
  bgColor?: keyof Omit<ThemeColors, 'getLabelColor'>
  children?: ReactNode
  flexGrow?: boolean
  fullHeight?: boolean
  fullSize?: boolean
  fullWidth?: boolean
  gap?: CSSProperties['gap']
  justifyContent?: CSSProperties['justifyContent']
  maxWidth?: CSSProperties['maxWidth']
  overflow?: CSSProperties['overflow']
  padding?: CSSProperties['padding']
  position?: CSSProperties['position']
  radius?: CSSProperties['borderRadius']
  scrollable?: boolean
  wrap?: CSSProperties['flexWrap']
}

export type StackProps = FixedDirectionStackProps & {
  direction: CSSProperties['flexDirection']
}

const formatFlexAlignment = (
  value: CSSProperties['alignItems'] | CSSProperties['justifyContent']
) => {
  if (value === 'end' || value === 'start') {
    return `flex-${value}`
  }

  return value
}

const formatSelfAlignment = (
  value: CSSProperties['alignItems'] | CSSProperties['justifyContent']
) => {
  if (value === 'end' || value === 'start') {
    return `flex-${value}`
  }

  return value
}

const stack = ({
  alignItems,
  alignSelf,
  bgColor,
  direction,
  flexGrow,
  fullHeight,
  fullSize,
  fullWidth,
  gap,
  justifyContent,
  maxWidth,
  overflow,
  padding,
  position,
  radius,
  scrollable,
  wrap,
}: StackProps) => css`
  display: flex;
  flex-direction: ${direction};
  ${alignItems &&
  css`
    align-items: ${formatFlexAlignment(alignItems)};
  `}
  ${alignSelf &&
  css`
    align-self: ${formatSelfAlignment(alignSelf)};
  `}
  ${bgColor &&
  css`
    background-color: ${getColor(bgColor)};
  `}
  ${gap &&
  css`
    gap: ${toSizeUnit(gap)};
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
  ${!!maxWidth &&
  css`
    max-width: ${toSizeUnit(maxWidth)};
  `}
  ${overflow &&
  css`
    overflow: ${overflow};
  `}
  ${padding &&
  css`
    padding: ${toSizeUnit(padding)};
  `}
  ${position &&
  css`
    position: ${position};
  `}
  ${radius &&
  css`
    border-radius: ${toSizeUnit(radius)};
  `}
  ${scrollable &&
  css`
    overflow: auto;
    flex-basis: 0;
    min-height: 0;

    > * {
      flex-shrink: 0;
    }
  `}
`

export const Stack = styled.div<StackProps>`
  ${stack}
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
