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
export const useKaminoVaultsQuery = () =>
  useQuery({
    queryKey: ['kaminoVaults'] as const,
    queryFn: async (): Promise<KaminoVaultInfo[]> => {
      const results = await Promise.allSettled(
        kaminoVaultRegistry.map(({ address }) => fetchKaminoVaultInfo(address))
      )

      return results.flatMap(result =>
        result.status === 'fulfilled' ? [result.value] : []
      )
    },
    // APY and the share rate move slowly, and the deposit form re-reads both
    // at build time — the figures here are display-only.
    staleTime: convertDuration(1, 'min', 'ms'),
  })
