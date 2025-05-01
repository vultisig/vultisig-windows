import { Chain, CosmosChain } from '@core/chain/Chain'

export const cosmosGasLimitRecord: Record<CosmosChain, number> = {
  [Chain.Cosmos]: 200000,
  [Chain.Osmosis]: 300000,
  [Chain.Kujira]: 200000,
  [Chain.Dydx]: 200000,
  [Chain.Noble]: 200000,
  [Chain.Akash]: 200000,
  [Chain.Terra]: 300000,
  [Chain.TerraClassic]: 300000,
  [Chain.THORChain]: 20000000,
  [Chain.MayaChain]: 2000000000,
}
