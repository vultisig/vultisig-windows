import { Chain } from '@core/chain/Chain'
import { isEvmChain } from '@core/ui/address-book/AddressBookChainType'
import { useVaults } from '@core/ui/storage/vaults'

/**
 * Returns the vault name if the given address belongs to any vault coin on the given chain, otherwise null.
 *
 * Generic hook — not send-specific. Used across send, keysign, and address book contexts
 * anywhere the UI needs to identify whether an address is a known user vault.
 *
 * EVM chains share address space and addresses are normalized to lowercase to handle checksum
 * differences, matching the behaviour of useAddressBookNameForAddress.
 */
export const useVaultNameForAddress = (
  address: string,
  chain: Chain
): string | null => {
  const vaults = useVaults()

  const index = new Map(
    vaults.flatMap(vault =>
      vault.coins.map(coin => [
        `${isEvmChain(coin.chain) ? 'evm' : coin.chain}:${coin.address.toLowerCase()}`,
        vault.name,
      ])
    )
  )

  const key = `${isEvmChain(chain) ? 'evm' : chain}:${address.toLowerCase()}`
  return index.get(key) ?? null
}
