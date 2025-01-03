import { CosmosChain } from '../../model/chain';

export const cosmosFeeCoinDenom: Record<CosmosChain, string> = {
  [CosmosChain.THORChain]: 'rune',
  [CosmosChain.Cosmos]: 'uatom',
  [CosmosChain.Osmosis]: 'uosmo',
  [CosmosChain.MayaChain]: 'ucacao',
  [CosmosChain.Dydx]: 'adydx',
  [CosmosChain.Kujira]: 'ukuji',
  [CosmosChain.Terra]: 'uluna',
  [CosmosChain.TerraClassic]: 'uluna',
  [CosmosChain.Noble]: 'uusdc',
};
