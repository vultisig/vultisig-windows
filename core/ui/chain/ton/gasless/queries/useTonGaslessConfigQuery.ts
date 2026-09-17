import { useQuery } from '@tanstack/react-query'
import { getTonGaslessConfig } from '@vultisig/core-chain/chains/ton/gasless/api'

type UseTonGaslessConfigQueryInput = {
  enabled?: boolean
}

/**
 * The gasless relay's published config: its address and the jettons it takes
 * the commission in. Slow-moving, so it is cached for ten minutes; a send that
 * cannot be gasless anyway (native TON, V4R2) does not fetch it.
 */
export const useTonGaslessConfigQuery = ({
  enabled = true,
}: UseTonGaslessConfigQueryInput = {}) =>
  useQuery({
    queryKey: ['tonGaslessConfig'] as const,
    queryFn: getTonGaslessConfig,
    enabled,
    staleTime: 10 * 60_000,
  })
