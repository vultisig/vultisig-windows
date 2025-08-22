import { CosmosChain } from '@core/chain/Chain'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'

const cosmosChainId: Record<CosmosChain, string> = {
  [CosmosChain.THORChain]: 'thorchain-1',
  [CosmosChain.Cosmos]: 'cosmoshub-4',
  [CosmosChain.Osmosis]: 'osmosis-1',
  [CosmosChain.MayaChain]: 'mayachain-mainnet-v1',
  [CosmosChain.Dydx]: 'dydx-1',
  [CosmosChain.Kujira]: 'kaiyo-1',
  [CosmosChain.Terra]: 'phoenix-1',
  [CosmosChain.TerraClassic]: 'columbus-5',
  [CosmosChain.Noble]: 'noble-1',
  [CosmosChain.Akash]: 'akashnet-2',
}

export const getCosmosChainId = (chain: CosmosChain): string => {
  return cosmosChainId[chain]
}

export const getCosmosChainByChainId = (
  chainId: string
): CosmosChain | undefined => {
  return mirrorRecord(cosmosChainId)[chainId]
}
