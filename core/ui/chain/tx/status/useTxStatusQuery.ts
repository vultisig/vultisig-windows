import { useQuery } from '@tanstack/react-query'

import { Chain } from '../../../../chain/Chain'
import { getTxStatus } from '../../../../chain/tx/status'

type UseTxStatusQueryInput = {
  chain: Chain
  hash: string
}

export const useTxStatusQuery = ({ chain, hash }: UseTxStatusQueryInput) => {
  return useQuery({
    queryKey: ['txStatus', chain, hash],
    queryFn: () => getTxStatus({ chain, hash }),
    refetchInterval: query => {
      const status = query.state.data?.status
      if (status === 'success' || status === 'error') {
        return false
      }
      return 3000
    },
  })
}
