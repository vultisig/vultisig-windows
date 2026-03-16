import { Chain } from '@core/chain/Chain'
import { isEvmChain } from '@core/ui/address-book/AddressBookChainType'
import { useAddressBookItemsQuery } from '@core/ui/storage/addressBook'

/**
 * Returns the address book contact title if the given address is saved for the given chain,
 * otherwise null. Returns null while address book data is loading.
 *
 * EVM chains share address space — an entry saved under any EVM chain matches any EVM chain.
 * EVM addresses are normalized to lowercase before comparison to handle checksum differences.
 * Non-EVM addresses (Solana base58, Bitcoin bech32, etc.) are compared case-sensitively.
 * Structurally similar to useVaultNameForAddress.
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
      `${isEvmChain(item.chain) ? 'evm' : item.chain}:${isEvmChain(item.chain) ? item.address.toLowerCase() : item.address}`,
      item.title,
    ])
  )

  const key = `${isEvmChain(chain) ? 'evm' : chain}:${isEvmChain(chain) ? address.toLowerCase() : address}`
  return index.get(key) ?? null
}
