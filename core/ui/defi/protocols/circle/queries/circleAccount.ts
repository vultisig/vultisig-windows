import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import {
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

export const useCircleAccount = () => {
  const { data } = useCircleAccountQuery()
  return shouldBePresent(data, 'circle account')
}
