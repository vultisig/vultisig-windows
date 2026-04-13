import { useQuery } from '@tanstack/react-query'
import { getClaimWithProofDisabled } from '@vultisig/core-chain/chains/cosmos/qbtc/claim/getClaimWithProofDisabled'

/** Queries whether ClaimWithProof is currently disabled on the QBTC chain. */
export const useClaimWithProofDisabledQuery = () => {
  return useQuery({
    queryKey: ['qbtcClaimWithProofDisabled'],
    queryFn: getClaimWithProofDisabled,
  })
}
