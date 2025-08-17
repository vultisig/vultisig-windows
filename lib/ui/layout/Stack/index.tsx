import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { CSSProperties } from '@lib/ui/props'
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
  maxWidth?: React.CSSProperties['maxWidth']
  scrollable?: boolean
}

export type StackProps = FixedDirectionStackProps & {
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
  maxWidth,
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
    ${!!maxWidth &&
  css`
    max-width: ${toSizeUnit(maxWidth)};
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

const cssPropertiesToString = (props: CSSProperties) => {
  return Object.entries(props)
    .map(
      ([key, value]) =>
        `${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}: ${value};`
    )
    .join('\n')
}

const stackPropertiesToString = (props: DefStackProps) => {
  const { $after, $before, $hover, $style } = props

  return css`
    ${$style && cssPropertiesToString($style)}

    ${$after &&
    css`
      &::after {
        ${cssPropertiesToString({ ...$after, content: $after.content || `''` })}
      }
    `}

  ${$before &&
    css`
      &::before {
        ${cssPropertiesToString({
          ...$before,
          content: $before.content || `''`,
        })}
      }
    `}

  ${$hover &&
    css`
      ${!$style?.transition &&
      css`
        transition: all 0.2s;
      `}

      &:hover {
        ${cssPropertiesToString($hover)}
      }
    `}
  `
}

const newStack = (props: NewStackProps) => {
  const { $media } = props

  return css`
    ${stackPropertiesToString(props)}

    ${$media?.sm &&
    css`
      @media (min-width: 576px) {
        ${stackPropertiesToString($media.sm)}
      }
    `}
    
    ${$media?.lg &&
    css`
      @media (min-width: 992px) {
        ${stackPropertiesToString($media.lg)}
      }
    `}

    ${$media?.xl &&
    css`
      @media (min-width: 1200px) {
        ${stackPropertiesToString($media.xl)}
      }
    `}
  `
}

export const NewStack = styled.div<NewStackProps>`
  ${newStack}
`

export const NewHStack = styled.div<NewStackProps>`
  ${({ $style, ...props }) =>
    newStack({
      ...props,
      $style: { ...($style || {}), display: 'flex', flexDirection: 'row' },
    })}
`

export const NewVStack = styled.div<NewStackProps>`
  ${({ $style, ...props }) =>
    newStack({
      ...props,
      $style: { ...($style || {}), display: 'flex', flexDirection: 'column' },
    })}
`

type DefStackProps = {
  $after?: CSSProperties
  $before?: CSSProperties
  $hover?: CSSProperties
  $style?: CSSProperties
}

type NewStackProps = DefStackProps & {
  $media?: { sm?: DefStackProps; lg?: DefStackProps; xl?: DefStackProps }
}
