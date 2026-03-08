import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isMLDSAInitiallyEnabled = false

type SetIsMLDSAEnabledFunction = (isMLDSAEnabled: boolean) => Promise<void>

type GetIsMLDSAEnabledFunction = () => Promise<boolean>

export type MLDSAEnabledStorage = {
  getIsMLDSAEnabled: GetIsMLDSAEnabledFunction
  setIsMLDSAEnabled: SetIsMLDSAEnabledFunction
}

export const useIsMLDSAEnabledQuery = () => {
  const { getIsMLDSAEnabled } = useCore()

  return useQuery({
    queryKey: [StorageKey.isMLDSAEnabled],
    queryFn: getIsMLDSAEnabled,
    ...noRefetchQueryOptions,
  })
}

export const useIsMLDSAEnabled = () => {
  const { data } = useIsMLDSAEnabledQuery()

  return shouldBeDefined(data)
}

export const useSetIsMLDSAEnabledMutation = () => {
  const { setIsMLDSAEnabled } = useCore()
  const refetchQueries = useRefetchQueries()

  const mutationFn: SetIsMLDSAEnabledFunction = async input => {
    await setIsMLDSAEnabled(input)
    await refetchQueries([StorageKey.isMLDSAEnabled])
  }

  return useMutation({
    mutationFn,
  })
}
