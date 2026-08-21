import { useQuery } from '@tanstack/react-query'
import { KaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/models'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { fetchKaminoVaultInfo } from '@vultisig/core-chain/chains/solana/kamino/vaultInfo'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

/**
 * Hydrates every curated Kamino vault with its live state and metrics.
 *
 * A vault whose hydration failed is dropped rather than failing the whole
 * list: the others stay usable, and hydration refuses any response that
 * disagrees with the registry's pinned identity — so a dropped entry is one
 * that could not be trusted, not one we chose not to show.
 */
/** The vault-hydration query key, shared with the DeFi refresh. */
export const kaminoVaultsQueryKey = ['kaminoVaults'] as const

export const useKaminoVaultsQuery = () =>
  useQuery({
    queryKey: kaminoVaultsQueryKey,
    queryFn: async (): Promise<KaminoVaultInfo[]> => {
      const results = await Promise.allSettled(
        kaminoVaultRegistry.map(({ address }) => fetchKaminoVaultInfo(address))
      )

      const vaults = results.flatMap(result =>
        result.status === 'fulfilled' ? [result.value] : []
      )

      // Every vault failing is a failed read, not an empty registry, and
      // `allSettled` would otherwise resolve it as one — sending a user who
      // enabled vaults to the opt-in banner with nothing to retry.
      if (vaults.length === 0 && results.length > 0) {
        throw new Error('No Kamino vault could be loaded')
      }

      return vaults
    },
    // APY and the share rate move slowly, and the deposit form re-reads both
    // at build time — the figures here are display-only.
    staleTime: convertDuration(1, 'min', 'ms'),
  })
