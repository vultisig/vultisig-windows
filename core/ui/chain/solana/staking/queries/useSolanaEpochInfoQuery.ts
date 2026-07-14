import { useQuery } from '@tanstack/react-query'
import { fetchSolanaEpochInfo } from '@vultisig/core-chain/chains/solana/staking/rpc'

/**
 * Current Solana epoch info — drives activation-state derivation and the
 * cooldown copy. Cached ~45s (the epoch advances slowly relative to UI reads).
 */
export const useSolanaEpochInfoQuery = () =>
  useQuery({
    queryKey: ['solanaEpochInfo'] as const,
    queryFn: fetchSolanaEpochInfo,
    staleTime: 45_000,
  })
