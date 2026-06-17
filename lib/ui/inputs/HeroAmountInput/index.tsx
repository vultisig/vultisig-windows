import { HStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { bigIntToDecimalString } from '@vultisig/lib-utils/bigint/bigIntToDecimalString'
import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'

type HeroAmountInputProps = InputProps<bigint | null> & {
  ticker: string
  decimals: number
}

const placeholder = formatAmount(0)

const baseFontSize = 34
const minFontSize = 16
const tickerGap = 4

export const HeroAmountInput = ({
  value,
  onChange,
  ticker,
  decimals,
}: HeroAmountInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined)
  const [fontSize, setFontSize] = useState(baseFontSize)
  const [isReady, setIsReady] = useState(false)

  const displayValue =
    value !== null ? bigIntToDecimalString(value, decimals) : ''
  const trimmedDisplayValue = displayValue.includes('.')
    ? displayValue.replace(/\.?0+$/, '')
    : displayValue

  const [inputValue, setInputValue] = useState<string>(trimmedDisplayValue)
  const previousValueRef = useRef<bigint | null>(null)

  useEffect(() => {
    if (value !== previousValueRef.current) {
      const currentInputAsBigInt =
        inputValue === '' ? null : decimalStringToBigInt(inputValue, decimals)
      if (currentInputAsBigInt !== value) {
        setInputValue(trimmedDisplayValue)
      }
      previousValueRef.current = value
    }
  }, [value, trimmedDisplayValue, inputValue, decimals])

  // Measure the number + ticker at the base font, then scale the font down so the
  // whole amount fits its container (long 18-decimal values would otherwise
  // overflow). Short values keep the base font (scale = 1).
  const measureWidth = (text: string) => {
    if (!measureRef.current) return 0
    measureRef.current.textContent = text
    return measureRef.current.offsetWidth
  }

  useLayoutEffect(() => {
    const numberWidth = measureWidth(inputValue || placeholder)
    const tickerWidth = measureWidth(ticker)
    const available = containerRef.current?.clientWidth ?? 0
    const total = numberWidth + tickerGap + tickerWidth

    const scale =
      available > 0 && total > available ? (available * 0.96) / total : 1

    setFontSize(Math.max(minFontSize, baseFontSize * scale))
    setInputWidth(numberWidth * scale + 8)
    setIsReady(true)
  }, [inputValue, ticker])

  useEffect(() => {
    if (isReady && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isReady])

  const handleChange = useCallback(
    (newValue: string) => {
      newValue = newValue.replace(/-/g, '')
      if (newValue === '') {
        setInputValue('')
        onChange(null)
        return
      }

      // Allow "." as an intermediate state while typing a decimal like ".5"
      if (newValue === '.') {
        setInputValue('.')
        onChange(null)
        return
      }

      try {
        const chainAmount = decimalStringToBigInt(newValue, decimals)
        setInputValue(newValue)
        onChange(chainAmount)
      } catch {
        return
      }
    },
    [onChange, decimals]
  )

  return (
    <Container ref={containerRef}>
      <InputWrapper>
        <MeasureSpan ref={measureRef} aria-hidden />
        <StyledInput
          ref={inputRef}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={inputValue}
          onChange={e => handleChange(e.target.value)}
          style={
            inputWidth !== undefined
              ? { width: `${inputWidth}px`, fontSize: `${fontSize}px` }
              : { opacity: 0 }
          }
        />
      </InputWrapper>
      <Ticker color="shy" style={{ fontSize: `${fontSize}px` }}>
        {ticker}
      </Ticker>
    </Container>
  )
}

const Container = styled(HStack)`
  align-items: baseline;
  justify-content: center;
  gap: ${tickerGap}px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`

const InputWrapper = styled.div`
  position: relative;
  display: inline-block;
`

const MeasureSpan = styled.span`
  position: absolute;
  pointer-events: none;
  visibility: hidden;
  white-space: pre;
  font-size: ${baseFontSize}px;
  font-weight: 500;
  line-height: 37px;
  letter-spacing: -1px;
`

const StyledInput = styled.input`
  border: none;
  background: transparent;
  text-align: left;
  font-size: ${baseFontSize}px;
  font-weight: 500;
  line-height: 37px;
  letter-spacing: -1px;
  color: ${({ theme }) => theme.colors.text.toCssValue()};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSupporting.toCssValue()};
  }

  &:focus {
    outline: none;
  }
`

const Ticker = styled(Text)`
  font-size: ${baseFontSize}px;
  font-weight: 500;
  line-height: 37px;
  letter-spacing: -1px;
`
