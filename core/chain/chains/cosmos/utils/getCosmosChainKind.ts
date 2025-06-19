import {
  CosmosChain,
  CosmosChainKind,
  cosmosChainsByKind,
} from '@core/chain/Chain'

export function getCosmosChainKind(chain: CosmosChain): CosmosChainKind {
  for (const [kind, chainObject] of Object.entries(cosmosChainsByKind)) {
    if (chain in chainObject) {
      return kind as CosmosChainKind
    }
  }

  throw new Error(`Unknown cosmos chain kind for chain: ${chain}`)
}
