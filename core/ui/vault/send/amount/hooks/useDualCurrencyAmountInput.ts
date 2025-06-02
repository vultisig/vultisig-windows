import { useCallback, useEffect, useState } from 'react'

import { useSendAmount } from '../../state/amount'
import { useSendFormFieldState } from '../../state/formFields'

type CurrencyInputMode = 'base' | 'fiat'

interface UseDualCurrencyAmountInputProps {
  coinPrice: number | undefined
  currencyInputMode: CurrencyInputMode
}

export const useDualCurrencyAmountInput = ({
  coinPrice,
  currencyInputMode,
}: UseDualCurrencyAmountInputProps) => {
  const [inputValue, setInputValue] = useState<number | null>(null)
  const [value, setValue] = useSendAmount()
  const [, setFocusedSendField] = useSendFormFieldState()

  const handleUpdateAmount = useCallback(
    (rawValue: number | null) => {
      // Prevent negative amounts
      const sanitizedValue = rawValue !== null && rawValue < 0 ? 0 : rawValue
      setInputValue(sanitizedValue)

      const baseValue =
        currencyInputMode === 'base'
          ? sanitizedValue
          : coinPrice && sanitizedValue !== null
            ? coinPrice > 0
              ? sanitizedValue / coinPrice
              : null
            : null

      setValue(baseValue)

      setFocusedSendField(state => ({
        ...state,
        fieldsChecked: {
          ...state.fieldsChecked,
          amount: !!baseValue,
        },
      }))
    },
    [coinPrice, currencyInputMode, setFocusedSendField, setValue]
  )

  useEffect(() => {
    if (value !== null) {
      const updatedInput =
        currencyInputMode === 'base'
          ? value
          : coinPrice
            ? value * coinPrice
            : null

      setInputValue(updatedInput)
    }
  }, [value, coinPrice, currencyInputMode])

  return {
    inputValue,
    handleUpdateAmount,
    currencyInputMode,
    value,
  }
}
