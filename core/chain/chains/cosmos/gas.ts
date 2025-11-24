import { Chain, IbcEnabledCosmosChain } from '../../Chain'

const defaultGas = 7500n

export const cosmosGasRecord: Record<IbcEnabledCosmosChain, bigint> = {
  [Chain.Cosmos]: defaultGas,
  [Chain.Osmosis]: defaultGas,
  [Chain.Kujira]: defaultGas,
  [Chain.Terra]: defaultGas,
  [Chain.Dydx]: 2500000000000000n,
  [Chain.TerraClassic]: 100000000n,
  [Chain.Noble]: 30000n,
  [Chain.Akash]: 200000n,
}
