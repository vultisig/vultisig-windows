import { Chain } from '@vultisig/core-chain/Chain'

import { isEvmChain } from '../AddressBookChainType'
import { AddressBookItem } from '../model'

type IsAddressAlreadyAddedInput = {
  items: Pick<AddressBookItem, 'address' | 'id'>[]
  address: string
  chain: Chain
  editedItemId?: string
}

/**
 * Checks whether the address book already holds the given address.
 * EVM addresses differ only by EIP-55 checksum casing, so they are compared
 * case-insensitively; other chains use case-sensitive formats and must match
 * exactly. The entry being edited (`editedItemId`) is skipped so it can keep
 * its own address.
 */
export const isAddressAlreadyAdded = ({
  items,
  address,
  chain,
  editedItemId,
}: IsAddressAlreadyAddedInput) => {
  const normalize = (value: string) =>
    isEvmChain(chain) ? value.toLowerCase() : value

  return items.some(
    item =>
      item.id !== editedItemId && normalize(item.address) === normalize(address)
  )
}
