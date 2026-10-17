import { isEvmChain } from '@core/ui/address-book/AddressBookChainType'
import { AddressBookItem } from '@core/ui/address-book/model'
import { Chain } from '@vultisig/core-chain/Chain'

type IsAddressAlreadyAddedInput = {
  items: Pick<AddressBookItem, 'address'>[]
  address: string
  chain: Chain
  ignoredAddress?: string
}

/**
 * Checks whether the address book already holds the given address.
 * EVM addresses differ only by EIP-55 checksum casing, so they are compared
 * case-insensitively; other chains use case-sensitive formats and must match
 * exactly. `ignoredAddress` is the entry being edited, which may keep its own
 * address.
 */
export const isAddressAlreadyAdded = ({
  items,
  address,
  chain,
  ignoredAddress,
}: IsAddressAlreadyAddedInput) => {
  const normalize = (value: string) =>
    isEvmChain(chain) ? value.toLowerCase() : value

  return items.some(
    item =>
      normalize(item.address) === normalize(address) &&
      (ignoredAddress === undefined ||
        normalize(item.address) !== normalize(ignoredAddress))
  )
}
