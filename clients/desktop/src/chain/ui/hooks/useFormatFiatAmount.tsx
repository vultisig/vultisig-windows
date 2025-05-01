import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { formatAmount } from '@lib/utils/formatAmount'
import { useCallback } from 'react'

export const useFormatFiatAmount = () => {
  const fiatCurrency = useFiatCurrency()

  return useCallback(
    (value: number) => formatAmount(value, fiatCurrency),
    [fiatCurrency]
  )
}
