import { Chain } from '@core/chain/Chain'
import { isEvmChain } from '@core/ui/address-book/AddressBookChainType'
import { useAddressBookItems } from '@core/ui/storage/addressBook'

/**
 * Returns the address book contact title if the given address is saved for the given chain, otherwise null.
 *
 * EVM chains share address space — an entry saved under any EVM chain matches any EVM chain.
 * Mirrors useVaultNameForAddress in structure and semantics.
 */
export const useAddressBookNameForAddress = (
  address: string,
  chain: Chain
): string | null => {
  const items = useAddressBookItems()

  const index = new Map(
    items.map(item => [
      `${isEvmChain(item.chain) ? 'evm' : item.chain}:${item.address}`,
      item.title,
    ])
  )

  const key = `${isEvmChain(chain) ? 'evm' : chain}:${address}`
  return index.get(key) ?? null
}
