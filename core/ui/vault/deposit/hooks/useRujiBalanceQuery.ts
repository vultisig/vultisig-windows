import { fetchRujiBalance } from '@core/chain/chains/thorchain/ruji/services/fetchRujiBalance'
import { useQuery } from '@tanstack/react-query'

const staleTime = 30_000

export const useRujiBalanceQuery = (address: string) =>
  useQuery({
    queryKey: ['rujiBalance', address],
    enabled: !!address,
    staleTime,
    queryFn: () => fetchRujiBalance(address!),
  })
