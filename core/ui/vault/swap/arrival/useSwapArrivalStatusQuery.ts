import { useQuery } from '@tanstack/react-query'
import {
  getSwapArrivalStatus,
  isSwapArrivalStatusTerminal,
} from '@vultisig/core-chain/swap/utils/getSwapArrivalStatus'

import { TrackedSwapArrivalProvider } from './swapArrivalProvider'

type UseSwapArrivalStatusQueryInput = {
  provider: TrackedSwapArrivalProvider | undefined
  txHash: string
  enabled: boolean
}

const swapArrivalPollingIntervalMs = 5000

/**
 * Polls the swap provider's own view of a swap until it pays out or refunds.
 * Runs only once the caller says the source transaction has confirmed — before
 * that the provider has nothing to report — and only for a tracked provider.
 * A failed read is a retry, not a verdict: the SDK throws on outages rather
 * than reporting them as swap failures.
 */
export const useSwapArrivalStatusQuery = ({
  provider,
  txHash,
  enabled,
}: UseSwapArrivalStatusQueryInput) =>
  useQuery({
    queryKey: ['swapArrivalStatus', provider, txHash],
    queryFn: () => {
      if (!provider) throw new Error('Swap arrival provider is required')
      return getSwapArrivalStatus({ provider, txHash })
    },
    enabled: enabled && provider !== undefined,
    refetchInterval: query => {
      const result = query.state.data
      if (result && isSwapArrivalStatusTerminal(result)) return false
      return swapArrivalPollingIntervalMs
    },
  })
