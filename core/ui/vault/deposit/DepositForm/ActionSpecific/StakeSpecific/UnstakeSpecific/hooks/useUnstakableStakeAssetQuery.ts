import { useMergeQueries } from '@lib/ui/query/hooks/useMergeQueries'

import { useUnstakableStcyQuery } from './useUnstakableSTcyQuery'
import { useUnstakableTcyQuery } from './useUnstakableTcyQuery'

export const useUnstakableStakeAssetQuery = ({
  address,
  autoCompound,
}: {
  address: string
  autoCompound: boolean
}) => {
  const tcyBalanceQuery = useUnstakableTcyQuery({
    address,
    options: {
      enabled: !!address && !autoCompound,
    },
  })
  const stcyBalanceQuery = useUnstakableStcyQuery({
    address,
    options: { enabled: !!address && autoCompound },
  })

  return useMergeQueries({
    stcyBalance: stcyBalanceQuery,
    tcyBalance: tcyBalanceQuery,
  })
}
