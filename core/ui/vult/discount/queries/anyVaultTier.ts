import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useVaults } from '@core/ui/storage/vaults'
import { useQueries } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getChainAddress } from '@vultisig/core-chain/publicKey/address/getChainAddress'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate'
import { vultDiscountTiers } from '@vultisig/core-chain/swap/affiliate/config'
import { isKeyImportVault } from '@vultisig/core-mpc/vault/Vault'

import {
  fetchVultDiscountTier,
  vultDiscountTierQueryKey,
  vultDiscountTierStaleTime,
} from './tier'

type HighestVaultDiscountTier = {
  tier: VultDiscountTier | null
  isPending: boolean
}

/**
 * Highest VULT discount tier across ALL vaults. Custom RPC entitlement is
 * app-wide: if any one vault qualifies, the feature unlocks and overrides apply
 * to every vault. The per-address query key is shared with the active-vault
 * tier query so the two dedupe.
 */
export const useHighestVaultDiscountTier = (): HighestVaultDiscountTier => {
  const vaults = useVaults()
  const walletCore = useAssertWalletCore()

  const queries = useQueries({
    queries: vaults.map(vault => {
      const ethCoin = vault.coins.find(coin => coin.chain === Chain.Ethereum)
      const address =
        ethCoin?.address ??
        (isKeyImportVault(vault) && !vault.chainPublicKeys?.[Chain.Ethereum]
          ? ''
          : getChainAddress({
              chain: Chain.Ethereum,
              walletCore,
              hexChainCode: vault.hexChainCode,
              publicKeys: vault.publicKeys,
              publicKeyMldsa: vault.publicKeyMldsa,
              chainPublicKeys: vault.chainPublicKeys,
            }))

      return {
        queryKey: vultDiscountTierQueryKey(address),
        queryFn: () => fetchVultDiscountTier(address),
        enabled: !!address,
        placeholderData: null,
        staleTime: vultDiscountTierStaleTime,
      }
    }),
  })

  const tier = queries.reduce<VultDiscountTier | null>((best, query) => {
    const current = query.data
    if (!current) return best
    if (!best) return current

    return vultDiscountTiers.indexOf(current) > vultDiscountTiers.indexOf(best)
      ? current
      : best
  }, null)

  return { tier, isPending: queries.some(query => query.isPending) }
}
