import { Chain } from '@core/chain/Chain'
import { isEvmChain } from '@core/ui/address-book/AddressBookChainType'
import { useVaults } from '@core/ui/storage/vaults'

type UseVaultNameForAddressInput = {
  address: string
  chain: Chain
}

/**
 * Returns the vault name if the given address belongs to any vault coin on the given chain, otherwise null.
 *
 * Generic hook — not send-specific. Used across send, keysign, and address book contexts
 * anywhere the UI needs to identify whether an address is a known user vault.
 *
 * EVM chains share address space and addresses are normalized to lowercase to handle checksum
 * differences, matching the behaviour of useAddressBookNameForAddress.
 */
export const useVaultNameForAddress = ({
  address,
  chain,
}: UseVaultNameForAddressInput): string | null => {
  const vaults = useVaults()

  const index = new Map(
    vaults.flatMap(vault =>
      vault.coins.map(coin => [
        `${isEvmChain(coin.chain) ? 'evm' : coin.chain}:${isEvmChain(coin.chain) ? coin.address.toLowerCase() : coin.address}`,
        vault.name,
      ])
    )
  )

  const key = `${isEvmChain(chain) ? 'evm' : chain}:${isEvmChain(chain) ? address.toLowerCase() : address}`
  return index.get(key) ?? null
}
