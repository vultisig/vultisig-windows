import styled from 'styled-components'

import { cropText } from '../css/cropText'
import { useFitFontSize } from '../hooks/useFitFontSize'
import { ValueProp } from '../props'

type FitTextProps = ValueProp<string> & {
  size: number
  minSize: number
}

/**
 * One line of text that fills its container's width and shrinks its font,
 * down to `minSize`, rather than overflowing; below that it ends in an
 * ellipsis. Color, weight and alignment are inherited from the parent.
 */
export const FitText = ({ value, size, minSize }: FitTextProps) => {
  const { setContainer, fontSize } = useFitFontSize({
    size,
    minSize,
    text: value,
  })

  return (
    <Container ref={setContainer} title={value} style={{ fontSize }}>
      {value}
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  ${cropText};
`
