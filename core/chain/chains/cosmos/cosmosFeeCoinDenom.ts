import { CosmosChain } from '@core/chain/Chain'

export const cosmosFeeCoinDenom: Record<CosmosChain, string> = {
  [CosmosChain.THORChain]: 'rune',
  [CosmosChain.Cosmos]: 'uatom',
  [CosmosChain.Osmosis]: 'uosmo',
  [CosmosChain.MayaChain]: 'cacao',
  [CosmosChain.Dydx]: 'adydx',
  [CosmosChain.Kujira]: 'ukuji',
  [CosmosChain.Terra]: 'uluna',
  [CosmosChain.TerraClassic]: 'uluna',
  [CosmosChain.Noble]: 'uusdc',
  [CosmosChain.Akash]: 'uakt',
}
