import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getTxStatus } from '@vultisig/core-chain/tx/status'

type UseTxStatusQueryInput = {
  chain: Chain
  hash: string
  /**
   * Solana only: the payload's blockhash deadline. With it the poll settles on
   * `expired` once the chain passes that height instead of running for good.
   */
  lastValidBlockHeight?: number
}

export const useTxStatusQuery = ({
  chain,
  hash,
  lastValidBlockHeight,
}: UseTxStatusQueryInput) => {
  return useQuery({
    queryKey: ['txStatus', chain, hash, lastValidBlockHeight],
    queryFn: () => getTxStatus({ chain, hash, lastValidBlockHeight }),
    refetchInterval: query => {
      const status = query.state.data?.status
      if (status === 'success' || status === 'error' || status === 'expired') {
        return false
      }
      return 3000
    },
  })
}
