import { Chain } from '@vultisig/core-chain/Chain'

/**
 * Longest address on chains where a shorter prefix can already be a valid
 * recipient: NEAR named account ids are valid from 2 characters, and a
 * 43-character prefix of a 44-character Solana address can decode to an
 * on-curve key. Other chains have a fixed length or a checksum.
 */
const extendableAddressMaxLength: Partial<Record<Chain, number>> = {
  [Chain.Near]: 64,
  [Chain.Solana]: 44,
}

type CanReceiverAddressGrowInput = {
  address: string
  chain: Chain
}

/**
 * Whether a valid address could still be a prefix of a longer valid address,
 * so the user may not be done typing it.
 */
export const canReceiverAddressGrow = ({
  address,
  chain,
}: CanReceiverAddressGrowInput) => {
  const maxLength = extendableAddressMaxLength[chain]

  return maxLength !== undefined && address.length < maxLength
}
