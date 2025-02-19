import { formatAmount } from '@lib/utils/formatAmount'
import { useCallback } from 'react'

import { useFiatCurrency } from '../../../preferences/state/fiatCurrency'

export const useFormatFiatAmount = () => {
  const [fiatCurrency] = useFiatCurrency()

  return useCallback(
    (value: number) => formatAmount(value, fiatCurrency),
    [fiatCurrency]
  )
}
