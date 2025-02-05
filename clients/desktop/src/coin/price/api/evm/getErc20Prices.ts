import { addQueryParams } from '@lib/utils/query/addQueryParams';
import { queryUrl } from '@lib/utils/query/queryUrl';
import { recordMap } from '@lib/utils/record/recordMap';

import { EvmChain } from '../../../../model/chain';
import { Endpoint } from '../../../../services/Endpoint';
import { defaultFiatCurrency } from '../../FiatCurrency';
import { CoinPricesResponse } from '../CoinPricesResponse';
import { GetCoinPricesInput } from '../GetCoinPricesInput';

const baseUrl = `${Endpoint.vultisigApiProxy}/coingeicko/api/v3/simple/token_price/`;

type Input = GetCoinPricesInput & {
  chain: EvmChain;
};

const coinGeckoNetwork: Record<EvmChain, string> = {
  [EvmChain.Ethereum]: 'ethereum',
  [EvmChain.Avalanche]: 'avalanche',
  [EvmChain.Base]: 'base',
  [EvmChain.Blast]: 'blast',
  [EvmChain.Arbitrum]: 'arbitrum-one',
  [EvmChain.Polygon]: 'polygon-pos',
  [EvmChain.Optimism]: 'optimistic-ethereum',
  [EvmChain.BSC]: 'binance-smart-chain',
  [EvmChain.Zksync]: 'zksync',
  [EvmChain.CronosChain]: 'cronos',
};

export const getErc20Prices = async ({
  ids,
  fiatCurrency = defaultFiatCurrency,
  chain,
}: Input) => {
  const url = addQueryParams(`${baseUrl}/${coinGeckoNetwork[chain]}`, {
    contract_addresses: ids.join(','),
    vs_currencies: fiatCurrency,
  });

  const result = await queryUrl<CoinPricesResponse>(url);

  return recordMap(result, value => value[fiatCurrency]);
};
