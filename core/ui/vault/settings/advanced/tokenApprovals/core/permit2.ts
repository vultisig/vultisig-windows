import { EvmChain } from '@vultisig/core-chain/Chain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { Address, parseAbi } from 'viem'

/** Uniswap's Permit2, deployed at the same address on every chain below. */
export const permit2Address: Address =
  '0x000000000022D473030F116dDEE9F6B43aC78BA3'

export const permit2Abi = parseAbi([
  'function allowance(address user, address token, address spender) view returns (uint160 amount, uint48 expiration, uint48 nonce)',
  'function lockdown((address token, address spender)[] approvals)',
  'event Approval(address indexed owner, address indexed token, address indexed spender, uint160 amount, uint48 expiration)',
  'event Permit(address indexed owner, address indexed token, address indexed spender, uint160 amount, uint48 expiration, uint48 nonce)',
])

/** Networks where Permit2 allowances are read. */
const permit2Chains = [
  EvmChain.Ethereum,
  EvmChain.Arbitrum,
  EvmChain.Polygon,
  EvmChain.BSC,
  EvmChain.Base,
  EvmChain.Optimism,
  EvmChain.Avalanche,
] as const satisfies readonly EvmChain[]

/**
 * Networks whose RPC answers an owner-filtered `eth_getLogs` over Permit2's
 * whole history. Elsewhere only the pairs in the vault's own approval history
 * are checked, which misses a permit signature someone else submitted.
 */
const permit2LogChains = [
  EvmChain.Ethereum,
  EvmChain.Arbitrum,
  EvmChain.Polygon,
  EvmChain.BSC,
] as const satisfies readonly EvmChain[]

/** Whether Permit2 allowances are read on this network. */
export const isPermit2Chain = (chain: EvmChain) => isOneOf(chain, permit2Chains)

/** Whether Permit2's own logs can be read in full on this network. */
export const isPermit2LogChain = (chain: EvmChain) =>
  isOneOf(chain, permit2LogChains)
