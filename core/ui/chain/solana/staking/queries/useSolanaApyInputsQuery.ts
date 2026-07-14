import { useQuery } from '@tanstack/react-query'
import {
  fetchSolanaInflationRate,
  fetchSolanaTotalSupply,
} from '@vultisig/core-chain/chains/solana/staking/rpc'

/**
 * The inputs to the on-chain APY fallback: the network inflation rate and the
 * total SOL supply (the staked-fraction denominator). Both move slowly, so they
 * are fetched together and cached 10min. Only consulted when the metadata
 * provider supplies no APY estimate.
 */
export const useSolanaApyInputsQuery = () =>
  useQuery({
    queryKey: ['solanaApyInputs'] as const,
    queryFn: async () => {
      const [inflationRate, totalSupplyLamports] = await Promise.all([
        fetchSolanaInflationRate(),
        fetchSolanaTotalSupply(),
      ])
      return { inflationRate, totalSupplyLamports }
    },
    staleTime: 10 * 60 * 1000,
  })
