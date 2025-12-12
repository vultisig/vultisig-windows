import { Chain } from '@core/chain/Chain'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useQuery } from '@tanstack/react-query'

import {
  CircleAccount,
  getCircleAccount,
  GetCircleAccountInput,
} from '../core/getCircleAccount'

export const getCircleAccountQueryKey = (input: GetCircleAccountInput) =>
  ['circle-account', input] as const

export const useCircleAccountQuery = () => {
  const ownerAddress = useCurrentVaultAddress(Chain.Ethereum)
  const input = { ownerAddress }

  return useQuery({
    queryKey: getCircleAccountQueryKey(input),
    queryFn: () => getCircleAccount(input),
  })
}

export const useCircleAccount = (): CircleAccount => {
  const { data } = useCircleAccountQuery()
  return shouldBePresent(data, 'circle account')
}
