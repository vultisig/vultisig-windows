import { usdc } from '@core/chain/coin/knownTokens'
import { HStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { bigIntToDecimalString } from '@lib/utils/bigint/bigIntToDecimalString'
import { decimalStringToBigInt } from '@lib/utils/bigint/decimalStringToBigInt'
import { formatAmount } from '@lib/utils/formatAmount'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'

type CircleDepositAmountInputProps = InputProps<bigint | null>

const placeholder = formatAmount(0)

export const CircleDepositAmountInput = ({
  value,
  onChange,
}: CircleDepositAmountInputProps) => {
  const measureRef = useRef<HTMLSpanElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputWidth, setInputWidth] = useState<number | undefined>(undefined)
  const [isReady, setIsReady] = useState(false)

  const displayValue =
    value !== null ? bigIntToDecimalString(value, usdc.decimals) : ''
  const trimmedDisplayValue = displayValue.includes('.')
    ? displayValue.replace(/\.?0+$/, '')
    : displayValue

  const [inputValue, setInputValue] = useState<string>(trimmedDisplayValue)
  const previousValueRef = useRef<bigint | null>(null)

  useEffect(() => {
    if (value !== previousValueRef.current) {
      const currentInputAsBigInt =
        inputValue === ''
          ? null
          : decimalStringToBigInt(inputValue, usdc.decimals)
      if (currentInputAsBigInt !== value) {
        setInputValue(trimmedDisplayValue)
      }
      previousValueRef.current = value
    }
  }, [value, trimmedDisplayValue, inputValue])

  const measureWidth = (text: string) => {
    if (!measureRef.current) return 0
    measureRef.current.textContent = text
    const width = measureRef.current.offsetWidth
    const padding = 8
    return width + padding
  }

  useLayoutEffect(() => {
    if (inputWidth === undefined) {
      const placeholderWidth = measureWidth(placeholder)
      setInputWidth(placeholderWidth)
      setIsReady(true)
      return
    }

    const text = inputValue || ''
    const measureText = text || placeholder
    const width = measureWidth(measureText)
    setInputWidth(width)
  }, [inputValue, inputWidth])

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

      try {
        const chainAmount = decimalStringToBigInt(newValue, usdc.decimals)
        setInputValue(newValue)
        onChange(chainAmount)
      } catch {
        return
      }
    },
    [onChange]
  )

  return (
    <Container>
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
              ? { width: `${inputWidth}px` }
              : { opacity: 0 }
          }
        />
      </InputWrapper>
      <Ticker color="shy">{usdc.ticker}</Ticker>
    </Container>
  )
}

const Container = styled(HStack)`
  align-items: baseline;
  justify-content: center;
  gap: 4px;
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
  font-size: 34px;
  font-weight: 500;
  line-height: 37px;
  letter-spacing: -1px;
`

const StyledInput = styled.input`
  border: none;
  background: transparent;
  text-align: left;
  font-size: 34px;
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
  font-size: 34px;
  font-weight: 500;
  line-height: 37px;
  letter-spacing: -1px;
`
