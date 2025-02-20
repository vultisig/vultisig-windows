import { EvmChain } from '@core/chain/Chain'
import { rootApiUrl } from '@core/config'
import { defaultFiatCurrency, FiatCurrency } from '@core/config/FiatCurrency'
import { addQueryParams } from '@lib/utils/query/addQueryParams'

import { queryCoingeickoPrices } from '../queryCoingeickoPrices'

const baseUrl = `${rootApiUrl}/coingeicko/api/v3/simple/token_price/`

type Input = {
  ids: string[]
  fiatCurrency?: FiatCurrency
  chain: EvmChain
}

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
}

export const getErc20Prices = async ({
  ids,
  fiatCurrency = defaultFiatCurrency,
  chain,
}: Input) => {
  const url = addQueryParams(`${baseUrl}/${coinGeckoNetwork[chain]}`, {
    contract_addresses: ids.join(','),
    vs_currencies: fiatCurrency,
  })

  return queryCoingeickoPrices({
    url,
    fiatCurrency,
  })
}
