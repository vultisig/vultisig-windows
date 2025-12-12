import { useQuery } from '@tanstack/react-query'

import { getCircleAccountUsdcBalance } from '../core/getCircleAccountUsdcBalance'
import { useCircleAccount } from './circleAccount'

const getCircleAccountUsdcBalanceQueryKey = (walletId: string) =>
  ['circle-account-usdc-balance', walletId] as const

export const useCircleAccountUsdcBalanceQuery = () => {
  const { id } = useCircleAccount()

  return useQuery({
    queryKey: getCircleAccountUsdcBalanceQueryKey(id),
    queryFn: () => getCircleAccountUsdcBalance(id),
  })
}
