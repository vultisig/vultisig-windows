import { EvmChain, OtherChain } from '@vultisig/core-chain/Chain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

/**
 * EVM chains whose approvals can be listed: the networks the 1inch History
 * and Balance APIs cover. Blast, Mantle and Sei are not covered.
 */
export const tokenApprovalsEvmChains = [
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

/** EVM chains whose approvals cannot be listed yet, named on the page. */
export const tokenApprovalsUncheckedEvmChains = Object.values(EvmChain).filter(
  chain => !isOneOf(chain, tokenApprovalsEvmChains)
)

/** Every chain whose approvals the page can list. */
export type TokenApprovalsChain =
  | (typeof tokenApprovalsEvmChains)[number]
  | typeof OtherChain.Solana
