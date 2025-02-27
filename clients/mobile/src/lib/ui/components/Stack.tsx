import { FlexStyle } from 'react-native'
import { css } from 'styled-components/native'
import styled from 'styled-components/native'

type FixedDirectionStackProps = {
  gap?: number
  alignItems?: FlexStyle['alignItems']
  justifyContent?: FlexStyle['justifyContent']
  wrap?: FlexStyle['flexWrap']
  fullWidth?: boolean
  fullHeight?: boolean
  fullSize?: boolean
  flexGrow?: boolean
  children?: React.ReactNode
  scrollable?: boolean
}

export type StackProps = FixedDirectionStackProps & {
  direction: FlexStyle['flexDirection']
}

export const stack = ({
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
  flex-direction: ${direction};
  ${gap &&
  css`
    gap: ${gap}px;
  `}
  ${alignItems &&
  css`
    align-items: ${alignItems};
  `}
  ${justifyContent &&
  css`
    justify-content: ${justifyContent};
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
    flex-grow: 1;
  `}
  ${scrollable &&
  css`
    flex: 1;
  `}
`

const BaseStack = styled.View<StackProps>`
  ${stack}
`

const BaseScrollStack = styled.ScrollView<StackProps>`
  ${stack}
`

export const VStack = (props: FixedDirectionStackProps) => (
  <BaseStack direction="column" {...props} />
)

export const HStack = (props: FixedDirectionStackProps) => (
  <BaseStack direction="row" {...props} />
)

export const ScrollableVStack = (props: FixedDirectionStackProps) => (
  <BaseScrollStack direction="column" {...props} />
)

export const ScrollableHStack = (props: FixedDirectionStackProps) => (
  <BaseScrollStack direction="row" {...props} />
)
