import { formatFiatAmount } from '@core/ui/chain/utils/formatFiatAmount'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCallback } from 'react'

export const useFormatFiatAmount = () => {
  const currency = useFiatCurrency()

  return useCallback(
    (value: number) => formatFiatAmount({ value, currency }),
    [currency]
  )
}
