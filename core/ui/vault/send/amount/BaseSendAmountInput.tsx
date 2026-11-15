import { TextInput, TextInputProps } from '@lib/ui/inputs/TextInput'
import { InputProps } from '@lib/ui/props'
import { bigIntToDecimalString } from '@vultisig/lib-utils/bigint/bigIntToDecimalString'
import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
import { useEffect, useRef, useState } from 'react'

import {
  DecimalSeparator,
  getLocaleDecimalSeparator,
} from './getLocaleDecimalSeparator'

type BaseSendAmountInputProps = InputProps<bigint | null> &
  Pick<TextInputProps, 'validation' | 'placeholder' | 'disabled'> & {
    decimals: number
  }

type ParseSendAmountInputInput = {
  value: string
  decimals: number
  decimalSeparator: DecimalSeparator
}

/**
 * Normalizes a raw amount input string and parses it with exact bigint math.
 * Returns `null` for a cleared input, `undefined` for a silently rejected one
 * (invalid characters or more fraction digits than the coin supports), and a
 * `chainAmount` of `null` for a value the field must keep showing while it
 * holds no amount — a comma the locale does not use as its decimal point.
 * A separator is never read as digit grouping: `1,5` is one and a half or
 * refused, never fifteen (#5289).
 * Must never go through float64 — amounts with more than ~15 significant
 * digits would be silently perturbed before signing (#4488).
 */
export const parseSendAmountInput = ({
  value,
  decimals,
  decimalSeparator,
}: ParseSendAmountInputInput) => {
  let normalized = value.replace(/-/g, '')

  if (decimalSeparator === ',') {
    normalized = normalized.replace(/,/g, '.')
  }

  if (normalized.startsWith('.')) {
    normalized = `0${normalized}`
  }

  if (normalized === '') {
    return null
  }

  if (!/^\d*\.?\d*$/.test(normalized)) {
    // Dropping a refused comma would let the next digit join the integer
    // part, turning `1,5` into `15`, so keep it visible and hold no amount.
    return normalized.includes(',')
      ? { normalized, chainAmount: null }
      : undefined
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
  const decimalSeparator = getLocaleDecimalSeparator()

  const fullDecimalString =
    value !== null ? bigIntToDecimalString(value, decimals) : ''
  const trimmedDecimalString = fullDecimalString.includes('.')
    ? fullDecimalString.replace(/\.?0+$/, '')
    : fullDecimalString
  const [inputValue, setInputValue] = useState<string>(trimmedDecimalString)

  useEffect(() => {
    // Only update input if the value changed externally (not from user typing)
    if (value !== previousValueRef.current) {
      const parsed = parseSendAmountInput({
        value: inputValue,
        decimals,
        decimalSeparator,
      })
      const currentInputAsBigInt = parsed === null ? null : parsed?.chainAmount
      if (currentInputAsBigInt !== value) {
        setInputValue(trimmedDecimalString)
      }
      previousValueRef.current = value
    }
  }, [value, trimmedDecimalString, inputValue, decimals, decimalSeparator])

  const handleInputValueChange = (rawValue: string) => {
    const parsed = parseSendAmountInput({
      value: rawValue,
      decimals,
      decimalSeparator,
    })

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
        handleInputValueChange(event.clipboardData.getData('text'))
      }}
      data-testid="send-amount-input"
    />
  )
}
