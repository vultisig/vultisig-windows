import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { ReactNode } from 'react'
import styled from 'styled-components'

const subscriptDigitToNormal: Record<string, string> = {
  '₀': '0',
  '₁': '1',
  '₂': '2',
  '₃': '3',
  '₄': '4',
  '₅': '5',
  '₆': '6',
  '₇': '7',
  '₈': '8',
  '₉': '9',
}

const Subscript = styled.sub`
  font-size: 0.75em;
  line-height: 0;
`

const renderWithReadableSubscript = (text: string): ReactNode[] => {
  const parts: ReactNode[] = []
  let textBuffer = ''
  let subscriptBuffer = ''

  const flushText = () => {
    if (textBuffer) {
      parts.push(textBuffer)
      textBuffer = ''
    }
  }

  const flushSubscript = () => {
    if (subscriptBuffer) {
      parts.push(<Subscript key={parts.length}>{subscriptBuffer}</Subscript>)
      subscriptBuffer = ''
    }
  }

  for (const char of text) {
    const normalDigit = subscriptDigitToNormal[char]
    if (normalDigit) {
      flushText()
      subscriptBuffer += normalDigit
    } else {
      flushSubscript()
      textBuffer += char
    }
  }

  flushText()
  flushSubscript()

  return parts
}

/**
 * Renders a formatted fiat amount, upgrading the compact subscript notation used
 * for tiny prices (e.g. $0.0₄5962) into a real, legible `<sub>` element instead
 * of the hard-to-read Unicode subscript glyphs.
 */
export const FiatAmountText = ({ value }: { value: number }) => {
  const formatFiatAmount = useFormatFiatAmount()

  return <>{renderWithReadableSubscript(formatFiatAmount(value))}</>
}
