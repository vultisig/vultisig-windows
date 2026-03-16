import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getAddress } from 'viem'
import { getEnsAddress, normalize } from 'viem/ens'

/**
 * Resolves an ENS name to a checksummed EIP-55 Ethereum address.
 *
 * Uses the ENS Universal Resolver on Ethereum mainnet via the existing
 * viem public client. The name is normalized with UTS-46 before lookup.
 *
 * @param name - The ENS name to resolve (e.g. "vitalik.eth")
 * @returns The checksummed EIP-55 address
 * @throws If the name cannot be resolved or maps to the zero address
 */
export const resolveEnsName = async (name: string): Promise<string> => {
  const client = getEvmClient(EvmChain.Ethereum)

  const normalized = normalize(name)
  const address = await getEnsAddress(client, { name: normalized })

  if (!address) {
    throw new Error(`ENS name "${name}" could not be resolved`)
  }

  return getAddress(address)
}
