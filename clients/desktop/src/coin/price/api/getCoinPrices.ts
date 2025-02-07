import { rootApiUrl } from '@core/config';
import { addQueryParams } from '@lib/utils/query/addQueryParams';
import { queryUrl } from '@lib/utils/query/queryUrl';
import { recordMap } from '@lib/utils/record/recordMap';

import { defaultFiatCurrency } from '../FiatCurrency';
import { CoinPricesResponse } from './CoinPricesResponse';
import { GetCoinPricesInput } from './GetCoinPricesInput';

const baseUrl = `${rootApiUrl}/coingeicko/api/v3/simple/price`;

export const getCoinPrices = async ({
  ids,
  fiatCurrency = defaultFiatCurrency,
}: GetCoinPricesInput) => {
  const url = addQueryParams(baseUrl, {
    ids: ids.join(','),
    vs_currencies: fiatCurrency,
  });

  const result = await queryUrl<CoinPricesResponse>(url);

  return recordMap(result, value => value[fiatCurrency]);
};
