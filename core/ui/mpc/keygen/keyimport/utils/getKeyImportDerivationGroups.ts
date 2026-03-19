import { Chain, CosmosChain, EvmChain } from '@core/chain/Chain'

/**
 * Returns a stable key identifying which derivation path a chain uses.
 * Chains with the same key derive the same private key from a mnemonic,
 * so they can share a single MPC KeyImport session.
 *
 * Derivation path groupings (BIP44 coin type):
 * - EVM chains: m/44'/60'/0'/0/0
 * - THORChain + MayaChain: m/44'/931'/0'/0/0
 * - Cosmos-118 chains: m/44'/118'/0'/0/0
 * - Terra chains: m/44'/330'/0'/0/0
 * - All others: unique per chain
 */
const getDerivationKey = (chain: Chain): string => {
  const evmChains: readonly Chain[] = [
    EvmChain.Ethereum,
    EvmChain.Arbitrum,
    EvmChain.Avalanche,
    EvmChain.Base,
    EvmChain.CronosChain,
    EvmChain.BSC,
    EvmChain.Blast,
    EvmChain.Optimism,
    EvmChain.Polygon,
    EvmChain.Zksync,
    EvmChain.Mantle,
    EvmChain.Hyperliquid,
    EvmChain.Sei,
  ]
  if (evmChains.includes(chain)) return 'evm'

  if (chain === CosmosChain.THORChain || chain === CosmosChain.MayaChain)
    return 'thorchain'

  const cosmos118Chains: readonly Chain[] = [
    CosmosChain.Cosmos,
    CosmosChain.Kujira,
    CosmosChain.Dydx,
    CosmosChain.Osmosis,
    CosmosChain.Noble,
    CosmosChain.Akash,
  ]
  if (cosmos118Chains.includes(chain)) return 'cosmos-118'

  if (chain === CosmosChain.Terra || chain === CosmosChain.TerraClassic)
    return 'terra-330'

  return chain
}

type DerivationGroup = {
  representativeChain: Chain
  chains: Chain[]
}

/**
 * Groups chains by their BIP44 derivation path so that only one MPC
 * KeyImport session is needed per unique private key.
 */
export const getKeyImportDerivationGroups = (
  chains: Chain[]
): DerivationGroup[] => {
  const groupMap = new Map<string, Chain[]>()

  for (const chain of chains) {
    const key = getDerivationKey(chain)
    const group = groupMap.get(key)
    if (group) {
      group.push(chain)
    } else {
      groupMap.set(key, [chain])
    }
  }

  return Array.from(groupMap.values()).map(groupChains => ({
    representativeChain: groupChains[0],
    chains: groupChains,
  }))
}
