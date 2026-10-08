import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { useElementSize } from '@lib/ui/hooks/useElementSize'
import { getColor } from '@lib/ui/theme/getters'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import { CSSProperties, FC, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

type Styles = {
  justifyContent?: CSSProperties['justifyContent']
  color?: ThemeColor
  flexGrow?: boolean
  size?: CSSProperties['fontSize']
  weight?: CSSProperties['fontWeight']
  width?: CSSProperties['width']
}

const StyledTruncate = styled.span`
  position: absolute;
  visibility: hidden;
`

const StyledMiddleTruncate = styled.span<Styles>`
  ${({ color }) => {
    return (
      color &&
      css`
        color: ${getColor(color)};
      `
    )
  }};
  display: flex;
  ${({ flexGrow }) => {
    return (
      flexGrow &&
      css`
        flex-grow: 1;
      `
    )
  }};
  ${({ size }) => {
    return (
      size &&
      css`
        font-size: ${toSizeUnit(size)};
      `
    )
  }};
  ${({ weight }) => {
    return (
      weight &&
      css`
        font-weight: ${weight};
      `
    )
  }};
  ${({ justifyContent }) => {
    return (
      justifyContent &&
      css`
        justify-content: ${justifyContent};
      `
    )
  }};
  overflow: hidden;
  position: relative;
  white-space: nowrap;
  ${({ width }) => {
    return (
      width &&
      css`
        width: ${toSizeUnit(width)};
      `
    )
  }};
`

type MiddleTruncateProps = {
  onClick?: () => void
  text: string
} & Styles

/**
 * Single-line text that drops characters from its middle until it fits.
 * Give it a width of its own (`width`, `flexGrow`, or a block parent): the
 * text is out of flow while it is measured, so a content-sized flex item
 * collapses to 0px and renders nothing.
 */
export const MiddleTruncate: FC<MiddleTruncateProps> = ({
  onClick,
  text,
  ...rest
}) => {
  const [state, setState] = useState({
    counter: 0,
    ellipsis: '',
    truncating: true,
    wrapperWidth: 0,
  })
  const { counter, ellipsis, truncating, wrapperWidth } = state
  const elmRef = useRef<HTMLElement | null>(null)
  const { width = 0 } = useElementSize(elmRef.current) ?? {}

  const handleClick = () => {
    if (onClick) onClick()
  }

  useEffect(() => {
    if (elmRef.current) {
      const [child] = elmRef.current.children
      const clientWidth = child?.clientWidth ?? 0
      const chunkLen = Math.ceil(text.length / 2) - counter

      // Stop once there is nothing left to cut: a wrapper with no room
      // (e.g. collapsed to 0px) would otherwise re-render forever with the
      // text hidden.
      if (clientWidth > wrapperWidth && chunkLen > 0) {
        setState(prevState => ({
          ...prevState,
          counter: counter + 1,
          ellipsis: `${text.slice(0, chunkLen)}...${text.slice(chunkLen * -1)}`,
        }))
      } else {
        setState(prevState => ({
          ...prevState,
          counter: 0,
          truncating: false,
        }))
      }
    }
  }, [ellipsis, counter, elmRef, text, wrapperWidth])

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      ellipsis: text,
      truncating: true,
      wrapperWidth: width,
    }))
  }, [text, width])

  return onClick ? (
    <StyledMiddleTruncate
      ref={elmRef}
      onClick={handleClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      role="button"
      tabIndex={0}
      {...rest}
    >
      {truncating ? <StyledTruncate>{ellipsis}</StyledTruncate> : ellipsis}
    </StyledMiddleTruncate>
  ) : (
    <StyledMiddleTruncate ref={elmRef} {...rest}>
      {truncating ? <StyledTruncate>{ellipsis}</StyledTruncate> : ellipsis}
    </StyledMiddleTruncate>
  )
}
