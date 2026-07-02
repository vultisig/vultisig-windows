import { useQuery } from '@tanstack/react-query'
import { enrichValidatorsWithMetadata } from '@vultisig/core-chain/chains/solana/staking/metadata/enrichValidators'
import { fetchSolanaValidators } from '@vultisig/core-chain/chains/solana/staking/rpc'

/**
 * Lists Solana validators (`getVoteAccounts`), enriched with off-chain metadata
 * (name / logo / APY) via the swappable metadata provider. The metadata seam
 * never throws — on a provider outage the rows degrade to truncated vote pubkey
 * + on-chain commission. Cached 10min (the validator set moves slowly).
 */
export const useSolanaValidatorsQuery = () =>
  useQuery({
    queryKey: ['solanaValidators'] as const,
    queryFn: async () => {
      const validators = await fetchSolanaValidators()
      return enrichValidatorsWithMetadata(validators)
    },
    staleTime: 10 * 60 * 1000,
  })
