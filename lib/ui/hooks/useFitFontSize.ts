import { useState } from 'react'

import { useElementSize } from './useElementSize'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

type UseFitFontSizeInput = {
  /** Font size the text is shown at while it fits. */
  size: number
  /** Floor for the shrink; past it the text has to crop or scroll. */
  minSize: number
  /** The single line of text to fit. */
  text: string
  /** Width inside the container that does not scale with the font, such as gaps. */
  fixedWidth?: number
}

let measureContext: CanvasRenderingContext2D | null = null

type MeasureTextWidthInput = {
  text: string
  font: string
}

const measureTextWidth = ({ text, font }: MeasureTextWidthInput) => {
  measureContext ??= document.createElement('canvas').getContext('2d')
  if (!measureContext) return null

  measureContext.font = font
  return measureContext.measureText(text).width
}

/**
 * Shrinks a single line of text's font size until it fits its container.
 *
 * The text is measured on a canvas in the container's own font at `size`, so
 * the result does not depend on the size it is currently rendered at and no
 * hidden copy of the text has to live in the DOM.
 */
export const useFitFontSize = ({
  size,
  minSize,
  text,
  fixedWidth = 0,
}: UseFitFontSizeInput) => {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const containerSize = useElementSize(container)
  const [textWidth, setTextWidth] = useState<number | null>(null)

  useIsomorphicLayoutEffect(() => {
    if (!container) return

    const measure = () => {
      const { fontStyle, fontWeight, fontFamily } = getComputedStyle(container)
      setTextWidth(
        measureTextWidth({
          text,
          font: `${fontStyle} ${fontWeight} ${size}px ${fontFamily}`,
        })
      )
    }

    measure()

    // A web font that is still loading measures as its fallback, so measure
    // again once it arrives.
    const { fonts } = document
    fonts.addEventListener('loadingdone', measure)

    return () => {
      fonts.removeEventListener('loadingdone', measure)
    }
  }, [container, text, size])

  if (!containerSize || !textWidth) {
    return { setContainer, fontSize: size }
  }

  const availableWidth = containerSize.width - fixedWidth
  if (textWidth <= availableWidth) {
    return { setContainer, fontSize: size }
  }

  return {
    setContainer,
    fontSize: Math.max(
      minSize,
      Math.floor((size * availableWidth) / textWidth)
    ),
  }
}
