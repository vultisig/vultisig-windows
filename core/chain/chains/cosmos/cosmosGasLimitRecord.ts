import { Chain, CosmosChain } from '@core/chain/Chain'

import { areEqualCoins, CoinKey } from '../../coin/Coin'

const cosmosGasLimitRecord: Record<CosmosChain, bigint> = {
  [Chain.Cosmos]: 200000n,
  [Chain.Osmosis]: 300000n,
  [Chain.Kujira]: 200000n,
  [Chain.Dydx]: 200000n,
  [Chain.Noble]: 200000n,
  [Chain.Akash]: 200000n,
  [Chain.Terra]: 300000n,
  [Chain.TerraClassic]: 300000n,
  [Chain.THORChain]: 20000000n,
  [Chain.MayaChain]: 2000000000n,
}

export const getCosmosGasLimit = (coin: CoinKey<CosmosChain>): bigint => {
  if (areEqualCoins(coin, { chain: Chain.TerraClassic, id: 'uusd' })) {
    return 1_000_000n
  }

  return cosmosGasLimitRecord[coin.chain]
}
