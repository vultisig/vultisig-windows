import { pxToRem } from '@lib/utils/pxToRem'
import { FC, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

const StyledTruncate = styled.span`
  position: absolute;
  visibility: hidden;
`

const StyledComponent = styled.span<{ width?: number }>`
  display: block;
  position: relative;
  ${({ width }) => {
    return width
      ? css`
          width: ${pxToRem(width)};
        `
      : css``
  }}
`

interface ComponentProps {
  onClick?: () => void
  text: string
  width?: number
}

interface InitialState {
  counter: number
  ellipsis: string
  truncating: boolean
}

const Component: FC<ComponentProps> = ({ onClick, text, width }) => {
  const initialState: InitialState = {
    counter: 0,
    ellipsis: '',
    truncating: true,
  }
  const [state, setState] = useState(initialState)
  const { counter, ellipsis, truncating } = state
  const elmRef = useRef<HTMLSpanElement>(null)

  const handleClick = () => {
    if (onClick) onClick()
  }

  const ellipsisDidUpdate = (): void => {
    if (elmRef.current) {
      const [child] = elmRef.current.children
      const parentWidth = elmRef.current.clientWidth
      const childWidth = child?.clientWidth ?? 0

      if (childWidth > parentWidth) {
        const chunkLen = Math.ceil(text.length / 2) - counter

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
  }

  const componentDidUpdate = (): void => {
    setState(prevState => ({
      ...prevState,
      ellipsis: text,
      truncating: true,
    }))
  }

  useEffect(ellipsisDidUpdate, [ellipsis, counter, text])
  useEffect(componentDidUpdate, [text])

  return onClick ? (
    <StyledComponent
      ref={elmRef}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') handleClick()
      }}
      tabIndex={0}
      role="button"
      width={width}
    >
      {truncating ? <StyledTruncate>{ellipsis}</StyledTruncate> : ellipsis}
    </StyledComponent>
  ) : (
    <StyledComponent ref={elmRef} width={width}>
      {truncating ? <StyledTruncate>{ellipsis}</StyledTruncate> : ellipsis}
    </StyledComponent>
  )
}

export { Component as MiddleTruncate }

export default Component
