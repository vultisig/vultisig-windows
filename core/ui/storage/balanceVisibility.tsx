import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isBalanceInitallyVisible = true

export type SetIsBalanceVisibleFunction = (
  isBalanceVisible: boolean
) => Promise<void>

export type GetIsBalanceVisibleFunction = () => Promise<boolean>

export type BalanceVisibilityStorage = {
  getIsBalanceVisible: GetIsBalanceVisibleFunction
  setIsBalanceVisible: SetIsBalanceVisibleFunction
}

export const useIsBalanceVisibleQuery = () => {
  const { getIsBalanceVisible } = useCore()

  return useQuery({
    queryKey: [StorageKey.isBalanceVisible],
    queryFn: getIsBalanceVisible,
    ...fixedDataQueryOptions,
  })
}

export const useIsBalanceVisible = () => {
  const { data } = useIsBalanceVisibleQuery()

  return shouldBeDefined(data)
}

export const useSetIsBalanceVisibleMutation = () => {
  const { setIsBalanceVisible } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const mutationFn: SetIsBalanceVisibleFunction = async input => {
    await setIsBalanceVisible(input)
    await invalidateQueries([StorageKey.isBalanceVisible])
  }

  return useMutation({
    mutationFn,
  })
}
