import { fetchLiquidRUJI } from '@core/chain/chains/thorchain/ruji/services/fetchLiquid'
import { toDisplayRUJI } from '@core/chain/chains/thorchain/ruji/services/fetchStakeView'
import { useQuery } from '@tanstack/react-query'

export const useLiquidRUJI = (address: string) =>
  useQuery({
    queryKey: ['rujira', 'liquid', address],
    enabled: !!address,
    queryFn: () => fetchLiquidRUJI(address!),
    select: raw => ({ raw, display: toDisplayRUJI(raw) }),
  })
