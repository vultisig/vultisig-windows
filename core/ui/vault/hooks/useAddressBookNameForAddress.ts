import { Chain } from '@core/chain/Chain'
import { isEvmChain } from '@core/ui/address-book/AddressBookChainType'
import { useAddressBookItemsQuery } from '@core/ui/storage/addressBook'

/**
 * Returns the address book contact title if the given address is saved for the given chain,
 * otherwise null. Returns null while address book data is loading.
 *
 * EVM chains share address space — an entry saved under any EVM chain matches any EVM chain.
 * EVM addresses are normalized to lowercase before comparison to handle checksum differences.
 * Structurally similar to useVaultNameForAddress but adds case normalization, which the vault
 * hook does not perform.
 *
 * @param address - The recipient address to look up
 * @param chain - The chain the transaction is on
 * @returns The address book contact title if found, otherwise null
 */
export const useAddressBookNameForAddress = (
  address: string,
  chain: Chain
): string | null => {
  const { data: items } = useAddressBookItemsQuery()

  if (!items) return null

  const index = new Map(
    items.map(item => [
      `${isEvmChain(item.chain) ? 'evm' : item.chain}:${item.address.toLowerCase()}`,
      item.title,
    ])
  )

  const key = `${isEvmChain(chain) ? 'evm' : chain}:${address.toLowerCase()}`
  return index.get(key) ?? null
}
