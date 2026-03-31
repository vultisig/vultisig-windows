import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'
import { shouldBeDefined } from '@vultisig/lib-utils/assert/shouldBeDefined'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isBalanceInitallyVisible = true

type SetIsBalanceVisibleFunction = (isBalanceVisible: boolean) => Promise<void>

type GetIsBalanceVisibleFunction = () => Promise<boolean>

export type BalanceVisibilityStorage = {
  getIsBalanceVisible: GetIsBalanceVisibleFunction
  setIsBalanceVisible: SetIsBalanceVisibleFunction
}

export const useIsBalanceVisibleQuery = () => {
  const { getIsBalanceVisible } = useCore()

  return useQuery({
    queryKey: [StorageKey.isBalanceVisible],
    queryFn: getIsBalanceVisible,
    ...noRefetchQueryOptions,
  })
}

export const useIsBalanceVisible = () => {
  const { data } = useIsBalanceVisibleQuery()

  return shouldBeDefined(data)
}

export const useSetIsBalanceVisibleMutation = () => {
  const { setIsBalanceVisible } = useCore()
  const refetchQueries = useRefetchQueries()

  const mutationFn: SetIsBalanceVisibleFunction = async input => {
    await setIsBalanceVisible(input)
    await refetchQueries([StorageKey.isBalanceVisible])
  }

  return useMutation({
    mutationFn,
  })
}
