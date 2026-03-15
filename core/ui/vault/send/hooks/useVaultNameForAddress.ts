import { Chain } from '@core/chain/Chain'
import { useVaults } from '@core/ui/storage/vaults'

/** Returns the vault name if the given address belongs to any vault coin on the given chain, otherwise null. */
export const useVaultNameForAddress = (
  address: string,
  chain: Chain
): string | null => {
  const vaults = useVaults()

  const index = new Map(
    vaults.flatMap(vault =>
      vault.coins.map(coin => [`${coin.chain}:${coin.address}`, vault.name])
    )
  )

  return index.get(`${chain}:${address}`) ?? null
}
