import { useQuery } from '@tanstack/react-query'
import { fetchSolanaStakeAccounts } from '@vultisig/core-chain/chains/solana/staking/rpc'

/**
 * Fetches the owner's Solana stake accounts. Intentionally NOT cached
 * (`staleTime: 0`, `gcTime: 0`) — stake accounts must reflect a just-submitted
 * stake/unstake and newly accrued (auto-compounded) rewards.
 */
export const useSolanaStakeAccountsQuery = (owner: string) =>
  useQuery({
    queryKey: ['solanaStakeAccounts', owner] as const,
    queryFn: () => fetchSolanaStakeAccounts(owner),
    enabled: owner.length > 0,
    staleTime: 0,
    gcTime: 0,
  })
