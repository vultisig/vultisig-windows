import { useCallback, useEffect, useState } from 'react'

import { useSendAmount } from '../../state/amount'
import { useSendFormFieldState } from '../../state/formFields'
import { CurrencyInputMode } from '../ManageAmountInputField'
import { baseToFiat, clampNonNegative, fiatToBase } from '../utils'

type UseDualCurrencyAmountInputProps = {
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
    (raw: number | null) => {
      const clean = clampNonNegative(raw)
      setInputValue(clean)

      const base =
        currencyInputMode === 'base' ? clean : fiatToBase(clean, coinPrice)

      setValue(base)

      setFocusedSendField(s => ({
        ...s,
      }))
    },
    [coinPrice, currencyInputMode, setFocusedSendField, setValue]
  )

  useEffect(() => {
    if (value !== null) {
      const display =
        currencyInputMode === 'base' ? value : baseToFiat(value, coinPrice)

      setInputValue(display)
    }
  }, [value, coinPrice, currencyInputMode])

  return { inputValue, handleUpdateAmount, currencyInputMode, value }
}
