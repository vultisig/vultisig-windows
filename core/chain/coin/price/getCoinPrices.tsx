import { rootApiUrl } from '@core/config'
import { FiatCurrency } from '@core/config/FiatCurrency'
import { defaultFiatCurrency } from '@core/config/FiatCurrency'
import { addQueryParams } from '@lib/utils/query/addQueryParams'

import { queryCoingeickoPrices } from './queryCoingeickoPrices'
const baseUrl = `${rootApiUrl}/coingeicko/api/v3/simple/price`

type GetCoinPricesInput = {
  ids: string[]
  fiatCurrency?: FiatCurrency
}

export const getCoinPrices = async ({
  ids,
  fiatCurrency = defaultFiatCurrency,
}: GetCoinPricesInput) => {
  const url = addQueryParams(baseUrl, {
    ids: ids.join(','),
    vs_currencies: fiatCurrency,
  })

  return queryCoingeickoPrices({
    url,
    fiatCurrency,
  })
}
