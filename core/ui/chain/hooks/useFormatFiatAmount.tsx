import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { formatAmount } from '@lib/utils/formatAmount'
import { useCallback } from 'react'

export const useFormatFiatAmount = () => {
  const currency = useFiatCurrency()

  return useCallback(
    (value: number) => formatAmount(value, { currency }),
    [currency]
  )
}
