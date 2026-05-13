import type { EvmChain } from '@vultisig/core-chain/Chain'

import { lookupKnownEvmContract } from './knownEvmContracts'

type FormatLabeledEvmAddressInput = {
  address: string
  chain: EvmChain
}

const truncateMiddle = (address: string): string => {
  // Normalize the 0x prefix to lowercase so the rendered label always reads
  // `0x...` regardless of how the dApp cased the input. Preserve the body's
  // casing so EIP-55 checksummed addresses still display as the dApp sent
  // them.
  const body =
    address.startsWith('0x') || address.startsWith('0X')
      ? address.slice(2)
      : address
  return `0x${body.slice(0, 4)}…${body.slice(-4)}`
}

/**
 * Returns a human-readable label for a contract address when it matches the
 * SDK's known-contract registry, otherwise returns the raw address. Used by
 * the dApp keysign verify view to label `tx.to` and spender-style address
 * arguments (e.g. the `spender` in `approve(address,uint256)`).
 *
 * Output shape when known: `"Uniswap V2 Router (0x7a25…d56)"`.
 */
export const formatLabeledEvmAddress = ({
  address,
  chain,
}: FormatLabeledEvmAddressInput): string => {
  const known = lookupKnownEvmContract(address, { chain })
  if (!known) return address
  return `${known.label} (${truncateMiddle(address)})`
}
