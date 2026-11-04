import { EvmChain } from '@vultisig/core-chain/Chain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

/**
 * Every EVM chain the vault supports, in the order the network picker lists
 * them.
 */
export const tokenApprovalsChains = Object.values(EvmChain)

/**
 * EVM chains whose approvals can be listed. They match the networks the 1inch
 * History and Balance APIs cover; Blast, Mantle and Sei are not covered, so
 * they show an unsupported state instead of a list.
 */
const tokenApprovalsSupportedChains = [
  EvmChain.Ethereum,
  EvmChain.Base,
  EvmChain.Arbitrum,
  EvmChain.Optimism,
  EvmChain.Polygon,
  EvmChain.BSC,
  EvmChain.Avalanche,
  EvmChain.Zksync,
  EvmChain.CronosChain,
  EvmChain.Hyperliquid,
  EvmChain.Robinhood,
] as const satisfies readonly EvmChain[]

/**
 * Whether the approvals list can be loaded for this chain.
 */
export const isTokenApprovalsSupportedChain = (chain: EvmChain) =>
  isOneOf(chain, tokenApprovalsSupportedChains)
