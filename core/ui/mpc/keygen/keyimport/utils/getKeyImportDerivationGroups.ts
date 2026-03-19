import {
  Chain,
  cosmosChainsByKind,
  EvmChain,
  VaultBasedCosmosChain,
} from '@core/chain/Chain'

const evmChainValues = new Set<Chain>(Object.values(EvmChain))

const ibcCosmosChainValues = new Set<Chain>(
  Object.values(cosmosChainsByKind.ibcEnabled)
)

const vaultBasedCosmosChainValues = new Set<Chain>(
  Object.values(VaultBasedCosmosChain)
)

const terraChains = new Set<Chain>([Chain.Terra, Chain.TerraClassic])

/**
 * Returns a stable key identifying which derivation path a chain uses.
 * Chains with the same key derive the same private key from a mnemonic,
 * so they can share a single MPC KeyImport session.
 *
 * Derivation path groupings (BIP44 coin type):
 * - EVM chains: m/44'/60'/0'/0/0
 * - THORChain + MayaChain: m/44'/931'/0'/0/0
 * - IBC Cosmos chains (excl. Terra): m/44'/118'/0'/0/0
 * - Terra chains: m/44'/330'/0'/0/0
 * - All others: unique per chain
 */
const getDerivationKey = (chain: Chain): string => {
  if (evmChainValues.has(chain)) return 'evm'

  if (vaultBasedCosmosChainValues.has(chain)) return 'thorchain'

  if (ibcCosmosChainValues.has(chain)) {
    if (terraChains.has(chain)) return 'terra-330'
    return 'cosmos-118'
  }

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
