import {
  Chain,
  cosmosChainsByKind,
  EvmChain,
  VaultBasedCosmosChain,
} from '@vultisig/core-chain/Chain'

const evmChainValues = new Set<Chain>(Object.values(EvmChain))

const ibcCosmosChainValues = new Set<Chain>(
  Object.values(cosmosChainsByKind.ibcEnabled)
)

const vaultBasedCosmosChainValues = new Set<Chain>(
  Object.values(VaultBasedCosmosChain)
)

const terraChains = new Set<Chain>([Chain.Terra, Chain.TerraClassic])

/** BIP44 derivation paths shared by multiple chains. */
const sharedDerivationPath = {
  evm: "m/44'/60'/0'/0/0",
  thorchain: "m/44'/931'/0'/0/0",
  cosmos118: "m/44'/118'/0'/0/0",
  terra330: "m/44'/330'/0'/0/0",
} as const

type DerivationKey =
  | (typeof sharedDerivationPath)[keyof typeof sharedDerivationPath]
  | Chain

/**
 * Returns a stable key identifying which derivation path a chain uses.
 * Chains with the same key derive the same private key from a mnemonic,
 * so they can share a single MPC KeyImport session.
 */
export const getDerivationKey = (chain: Chain): DerivationKey => {
  if (evmChainValues.has(chain)) return sharedDerivationPath.evm

  if (vaultBasedCosmosChainValues.has(chain))
    return sharedDerivationPath.thorchain

  if (ibcCosmosChainValues.has(chain)) {
    if (terraChains.has(chain)) return sharedDerivationPath.terra330
    return sharedDerivationPath.cosmos118
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
