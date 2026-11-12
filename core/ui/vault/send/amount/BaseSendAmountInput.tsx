import { InputProps } from '@lib/ui/props'
import { bigIntToDecimalString } from '@vultisig/lib-utils/bigint/bigIntToDecimalString'
import { decimalStringToBigInt } from '@vultisig/lib-utils/bigint/decimalStringToBigInt'
import { useEffect, useRef, useState } from 'react'

import {
  DecimalSeparator,
  getDeviceDecimalSeparator,
  localizeDecimalSeparator,
  normalizeAmountText,
} from './normalizeDecimalSeparator'
import { SendAmountLine } from './SendAmountLine'

type BaseSendAmountInputProps = InputProps<bigint | null> & {
  decimals: number
  ticker: string
  placeholder: string
  disabled?: boolean
  isWarning?: boolean
}

type ParseSendAmountInputInput = {
  value: string
  decimals: number
  decimalSeparator: DecimalSeparator
}

/**
 * Normalizes a raw amount input string and parses it with exact bigint math.
 * A single comma is the decimal point where the locale writes one and is
 * refused elsewhere. Returns `null` for a cleared input, `undefined` for a
 * rejected one (invalid characters, more than one separator or more fraction
 * digits than the coin supports).
 * Must never go through float64 — amounts with more than ~15 significant
 * digits would be silently perturbed before signing (#4488).
 */
export const parseSendAmountInput = ({
  value,
  decimals,
  decimalSeparator,
}: ParseSendAmountInputInput) => {
  const normalized = normalizeAmountText({ text: value, decimalSeparator })
  if (normalized === undefined) {
    return undefined
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
  ticker,
  ...lineProps
}: BaseSendAmountInputProps) => {
  const previousValueRef = useRef<bigint | null>(null)
  const decimalSeparator = getDeviceDecimalSeparator()

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
    <SendAmountLine
      {...lineProps}
      unit={ticker}
      text={localizeDecimalSeparator({ text: inputValue, decimalSeparator })}
      onTextChange={handleInputValueChange}
      onPaste={event => {
        event.preventDefault()
        handleInputValueChange(event.clipboardData.getData('text'))
      }}
      testId="send-amount-input"
    />
  )
}
