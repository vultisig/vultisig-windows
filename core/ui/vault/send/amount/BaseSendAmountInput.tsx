import { TextInput, TextInputProps } from '@lib/ui/inputs/TextInput'
import { InputProps } from '@lib/ui/props'
import { bigIntToDecimalString } from '@vultisig/lib-utils/bigint/bigIntToDecimalString'
import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
import { useEffect, useRef, useState } from 'react'

import { AmountInputSource, isAmbiguousGroupedPaste } from './amountInputSource'

type BaseSendAmountInputProps = InputProps<bigint | null> &
  Pick<TextInputProps, 'validation' | 'placeholder' | 'disabled'> & {
    decimals: number
  }

type ParseSendAmountInputInput = {
  value: string
  decimals: number
  source?: AmountInputSource
}

/**
 * Normalizes a raw amount input string and parses it with exact bigint math.
 * Returns `null` for a cleared input and `undefined` for a rejected one
 * (invalid characters, a second separator, or more fraction digits than the
 * coin supports), which the field drops so it only ever holds a sendable
 * amount.
 * A typed comma is the decimal point, whatever the device locale: refusing it
 * would drop the keystroke and let the next digit join the integer part,
 * sending `1,5` as `15` (#5289). A paste that reads as one grouped thousand
 * is refused instead of silently meaning a thousandth as much — pass
 * `source: 'paste'` from an `onPaste` handler for that.
 * Must never go through float64 — amounts with more than ~15 significant
 * digits would be silently perturbed before signing (#4488).
 */
export const parseSendAmountInput = ({
  value,
  decimals,
  source = 'typing',
}: ParseSendAmountInputInput) => {
  if (isAmbiguousGroupedPaste({ value, source })) {
    return undefined
  }

  let normalized = value.replace(/-/g, '').replace(/,/g, '.')

  if (normalized.startsWith('.')) {
    normalized = `0${normalized}`
  }

  if (normalized === '') {
    return null
  }

  if (!/^\d*\.?\d*$/.test(normalized)) {
    return undefined
  }

  try {
    return {
      normalized,
      chainAmount: decimalStringToBigInt(normalized, decimals),
    }
  } catch {
    return undefined
  }
}

/**
 * Base-currency send amount input that keeps the typed string exact:
 * the stored chain amount always matches the visible digits.
 */
export const BaseSendAmountInput = ({
  value,
  onChange,
  decimals,
  ...inputProps
}: BaseSendAmountInputProps) => {
  const previousValueRef = useRef<bigint | null>(null)

  const fullDecimalString =
    value !== null ? bigIntToDecimalString(value, decimals) : ''
  const trimmedDecimalString = fullDecimalString.includes('.')
    ? fullDecimalString.replace(/\.?0+$/, '')
    : fullDecimalString
  const [inputValue, setInputValue] = useState<string>(trimmedDecimalString)

  useEffect(() => {
    // Only update input if the value changed externally (not from user typing)
    if (value !== previousValueRef.current) {
      const parsed = parseSendAmountInput({ value: inputValue, decimals })
      const currentInputAsBigInt = parsed === null ? null : parsed?.chainAmount
      if (currentInputAsBigInt !== value) {
        setInputValue(trimmedDecimalString)
      }
      previousValueRef.current = value
    }
  }, [value, trimmedDecimalString, inputValue, decimals])

  const handleInputValueChange = (
    rawValue: string,
    source: AmountInputSource = 'typing'
  ) => {
    const parsed = parseSendAmountInput({ value: rawValue, decimals, source })

    if (parsed === null) {
      setInputValue('')
      previousValueRef.current = null
      onChange(null)
      return
    }

    if (parsed === undefined) {
      return
    }

    setInputValue(parsed.normalized)
    previousValueRef.current = parsed.chainAmount
    onChange(parsed.chainAmount)
  }

  return (
    <TextInput
      {...inputProps}
      type="text"
      inputMode="decimal"
      onWheel={event => event.currentTarget.blur()}
      value={inputValue}
      onValueChange={handleInputValueChange}
      onPaste={event => {
        event.preventDefault()
        handleInputValueChange(event.clipboardData.getData('text'), 'paste')
      }}
      data-testid="send-amount-input"
    />
  )
}
