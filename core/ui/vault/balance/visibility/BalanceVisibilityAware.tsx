import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChildrenProp } from '@lib/ui/props'
import { range } from '@vultisig/lib-utils/array/range'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useLayoutEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import { useIsBalanceVisible } from '../../../storage/balanceVisibility'
import { animateGlyphSwap } from './animateGlyphSwap'
import { splitIntoGlyphs } from './splitIntoGlyphs'

type BalanceSize = 'm' | 'l' | 'xxxl'

type BalanceVisibilityAwareProps = ChildrenProp & {
  size?: BalanceSize
}

const hiddenContentLength: Record<BalanceSize, number> = {
  m: 4,
  l: 8,
  xxxl: 34,
}

// The design specifies an 8px dot with an 8px gap at the 28px balance size.
// Keeping it a ratio lets the smaller call sites scale down proportionally.
const dotRatio = 8 / 28

const Stack = styled.span`
  position: relative;
  display: inline-flex;
  justify-content: center;
  max-width: 100%;
  vertical-align: top;
  /* Lets a cropped parent still ellipsize the value. */
  overflow: inherit;
  text-overflow: inherit;
`

// A line box of its own, so the dots keep the line height of the text they
// replace and nothing below the balance moves.
const Content = styled.span<{ $isSwapping: boolean }>`
  display: inline-block;
  min-width: 0;
  overflow: inherit;
  text-overflow: inherit;

  ${({ $isSwapping }) =>
    $isSwapping &&
    css`
      visibility: hidden;
    `}
`

const PreviousContent = styled.span`
  display: none;
`

// Where the swap's glyph copies are drawn, centered on the value.
const GlyphLayer = styled.span`
  position: absolute;
  top: 0;
  left: 50%;
  translate: -50% 0;
  width: max-content;
  white-space: nowrap;
  pointer-events: none;
`

const HiddenBalance = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${dotRatio}em;
  vertical-align: middle;
`

const Dot = styled.span`
  flex-shrink: 0;
  width: ${dotRatio}em;
  height: ${dotRatio}em;
  ${borderRadius.pill};
  background-color: currentColor;
`

/**
 * Renders its children, or a row of dots while balances are hidden. Flipping
 * the visibility rolls one into the other glyph by glyph; the first render
 * never animates. The swap animates copies of both states, so the rendered
 * content is never touched.
 */
export const BalanceVisibilityAware = ({
  children,
  size = 'm',
}: BalanceVisibilityAwareProps) => {
  const isVisible = useIsBalanceVisible()
  const [shownVisibility, setShownVisibility] = useState(isVisible)
  const [swapKey, setSwapKey] = useState(0)
  const [isSwapping, setIsSwapping] = useState(false)

  const contentRef = useRef<HTMLSpanElement>(null)
  const previousContentRef = useRef<HTMLSpanElement>(null)
  const outgoingLayerRef = useRef<HTMLSpanElement>(null)
  const incomingLayerRef = useRef<HTMLSpanElement>(null)

  if (isVisible !== shownVisibility) {
    setShownVisibility(isVisible)
    setSwapKey(key => key + 1)
    setIsSwapping(true)
  }

  useLayoutEffect(() => {
    if (!isSwapping) return

    const outgoing = splitIntoGlyphs(
      shouldBePresent(previousContentRef.current)
    )
    const incoming = splitIntoGlyphs(shouldBePresent(contentRef.current))
    shouldBePresent(outgoingLayerRef.current).replaceChildren(outgoing.content)
    shouldBePresent(incomingLayerRef.current).replaceChildren(incoming.content)

    const swap = animateGlyphSwap({
      outgoing: outgoing.glyphs,
      incoming: incoming.glyphs,
    })

    let isCancelled = false
    swap.finished.then(() => {
      if (!isCancelled) setIsSwapping(false)
    })

    return () => {
      isCancelled = true
      swap.stop()
    }
  }, [isSwapping, swapKey])

  const renderState = (isShown: boolean) =>
    isShown ? (
      children
    ) : (
      <HiddenBalance>
        {range(hiddenContentLength[size]).map(key => (
          <Dot key={key} />
        ))}
      </HiddenBalance>
    )

  return (
    <Stack>
      <Content ref={contentRef} $isSwapping={isSwapping}>
        {renderState(isVisible)}
      </Content>
      {isSwapping ? (
        <>
          <PreviousContent ref={previousContentRef}>
            {renderState(!isVisible)}
          </PreviousContent>
          <GlyphLayer ref={outgoingLayerRef} aria-hidden />
          <GlyphLayer ref={incomingLayerRef} aria-hidden />
        </>
      ) : null}
    </Stack>
  )
}
