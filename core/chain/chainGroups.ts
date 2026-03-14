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

export const getDefaultVisibleChains = (chains: Chain[]): Chain[] => {
  const availableChains = new Set(chains)
  const handledChains = new Set<Chain>()
  const result: Chain[] = []

  chainGroups.forEach(({ representative, chains }) => {
    const availableGroupChains = chains.filter(chain =>
      availableChains.has(chain)
    )
    if (availableGroupChains.length === 0) return

    result.push(
      availableGroupChains.includes(representative)
        ? representative
        : availableGroupChains[0]
    )

    availableGroupChains.forEach(chain => handledChains.add(chain))
  })

  chains.forEach(chain => {
    if (handledChains.has(chain)) return
    result.push(chain)
  })

  return result
}
