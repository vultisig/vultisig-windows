import { useQuery } from '@tanstack/react-query'
import { solanaStakingConfig } from '@vultisig/core-chain/chains/solana/staking/config'
import { fetchSolanaRentReserve } from '@vultisig/core-chain/chains/solana/staking/rpc'

type UseSolanaRentReserveQueryInput = {
  /**
   * Keeps the Solana RPC read from firing on non-Solana screens that still call
   * the hook unconditionally. The placeholder below is served either way.
   */
  enabled?: boolean
}

/**
 * The rent-exempt reserve for a 200-byte stake account, in lamports. Changes
 * rarely, so it is cached 24h and seeded with the deterministic
 * `rentExemptReserveLamports` default so the delegate form can subtract the
 * reserve from the stakeable max before the live read returns.
 */
export const useSolanaRentReserveQuery = ({
  enabled = true,
}: UseSolanaRentReserveQueryInput = {}) =>
  useQuery({
    queryKey: ['solanaRentReserve'] as const,
    queryFn: fetchSolanaRentReserve,
    staleTime: 24 * 60 * 60 * 1000,
    placeholderData: solanaStakingConfig.rentExemptReserveLamports,
    enabled,
  })
