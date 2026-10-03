import { useState } from 'react'

import { measureTextWidth } from './measureTextWidth'
import { useElementSize } from './useElementSize'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

type UseFitTextInput = {
  /** Versions of the same text, longest first. */
  candidates: string[]
  /** Font size the text is rendered at. */
  size: number
  /** Width inside the container that is not the text, such as a sibling. */
  fixedWidth?: number
}

/**
 * Picks the longest of `candidates` that fits on one line in its container,
 * falling back to the shortest when none does.
 *
 * Candidates are measured on a canvas in the container's own font, so the
 * choice does not depend on which one is currently rendered.
 */
export const useFitText = ({
  candidates,
  size,
  fixedWidth = 0,
}: UseFitTextInput) => {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const containerSize = useElementSize(container)
  const [font, setFont] = useState<string | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (!container) return

    const readFont = () => {
      const { fontStyle, fontWeight, fontFamily } = getComputedStyle(container)
      setFont(`${fontStyle} ${fontWeight} ${size}px ${fontFamily}`)
    }

    readFont()

    // A web font that is still loading measures as its fallback, so read it
    // again once it arrives.
    const { fonts } = document
    fonts.addEventListener('loadingdone', readFont)

    return () => {
      fonts.removeEventListener('loadingdone', readFont)
    }
  }, [container, size])

  const shortest = candidates[candidates.length - 1]

  if (!containerSize || !font) {
    return { setContainer, text: candidates[0] }
  }

  const availableWidth = containerSize.width - fixedWidth
  const fitting = candidates.find(text => {
    const width = measureTextWidth({ text, font })
    return width === null || width <= availableWidth
  })

  return { setContainer, text: fitting ?? shortest }
}
