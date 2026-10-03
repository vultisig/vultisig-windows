let measureContext: CanvasRenderingContext2D | null = null

type MeasureTextWidthInput = {
  text: string
  font: string
}

/**
 * Measures a single line of text on a shared canvas, so no hidden copy of the
 * text has to live in the DOM. Returns `null` when no canvas is available.
 */
export const measureTextWidth = ({ text, font }: MeasureTextWidthInput) => {
  measureContext ??= document.createElement('canvas').getContext('2d')
  if (!measureContext) return null

  measureContext.font = font
  return measureContext.measureText(text).width
}
