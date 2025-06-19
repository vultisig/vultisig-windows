import {
  CosmosChain,
  CosmosChainKind,
  cosmosChainsByKind,
} from '@core/chain/Chain'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export function getCosmosChainKind(chain: CosmosChain): CosmosChainKind {
  const [key] = shouldBePresent(
    Object.entries(cosmosChainsByKind).find(([_, value]) => chain in value)
  )

  return key as CosmosChainKind
}
