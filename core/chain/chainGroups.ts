import { Chain, EvmChain } from './Chain'

export type ChainGroup = {
  representative: Chain
  chains: Chain[]
}

export const evmChains = Object.values(EvmChain) as Chain[]

const cosmosChains: Chain[] = [
  Chain.Cosmos,
  Chain.Osmosis,
  Chain.Kujira,
  Chain.Dydx,
  Chain.Noble,
  Chain.Akash,
]

const thorChains: Chain[] = [Chain.THORChain, Chain.MayaChain]

const terraChains: Chain[] = [Chain.Terra, Chain.TerraClassic]

export const chainGroups: ChainGroup[] = [
  { representative: Chain.Ethereum, chains: evmChains },
  { representative: Chain.Cosmos, chains: cosmosChains },
  { representative: Chain.THORChain, chains: thorChains },
  { representative: Chain.Terra, chains: terraChains },
]

export const groupedChainSet = new Set(chainGroups.flatMap(g => g.chains))
