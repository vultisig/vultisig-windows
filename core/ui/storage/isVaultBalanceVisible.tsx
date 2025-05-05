import { isVaultBalanceVisibleQueryKey } from '@core/ui/query/keys'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'

export const useIsVaultBalanceVisibleQuery = () => {
  const { getIsVaultBalanceVisible } = useCore()

  return useQuery({
    queryKey: isVaultBalanceVisibleQueryKey,
    queryFn: getIsVaultBalanceVisible,
  })
}

export const useIsVaultBalanceVisible = () => {
  const { data } = useIsVaultBalanceVisibleQuery()

  return shouldBeDefined(data)
}

export const useSetIsVaultBalanceVisibleMutation = () => {
  const { setIsVaultBalanceVisible } = useCore()
  const invalidateQueries = useInvalidateQueries()

  return useMutation({
    mutationFn: setIsVaultBalanceVisible,
    onSuccess: () => {
      invalidateQueries(isVaultBalanceVisibleQueryKey)
    },
  })
}
