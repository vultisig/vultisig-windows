import { useQuery } from '@tanstack/react-query'

import { getClaimWithProofDisabled } from '../getClaimWithProofDisabled'

/** Queries whether ClaimWithProof is currently disabled on the QBTC chain. */
export const useClaimWithProofDisabledQuery = () => {
  return useQuery({
    queryKey: ['qbtcClaimWithProofDisabled'],
    queryFn: getClaimWithProofDisabled,
  })
}
