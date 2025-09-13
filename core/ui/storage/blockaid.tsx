import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isBlockaidInitiallyEnabled = true

type SetIsBlockaidEnabledFunction = (
  isBlockaidEnabled: boolean
) => Promise<void>

type GetIsBlockaidEnabledFunction = () => Promise<boolean>

export type BlockaidStorage = {
  getIsBlockaidEnabled: GetIsBlockaidEnabledFunction
  setIsBlockaidEnabled: SetIsBlockaidEnabledFunction
}

export const useIsBlockaidEnabledQuery = () => {
  const { getIsBlockaidEnabled } = useCore()

  return useQuery({
    queryKey: [StorageKey.isBlockaidEnabled],
    queryFn: getIsBlockaidEnabled,
    ...noRefetchQueryOptions,
  })
}

export const useIsBlockaidEnabled = () => {
  const { data } = useIsBlockaidEnabledQuery()

  return shouldBeDefined(data)
}

export const useSetIsBlockaidEnabledMutation = () => {
  const { setIsBlockaidEnabled } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const mutationFn: SetIsBlockaidEnabledFunction = async input => {
    await setIsBlockaidEnabled(input)
    await invalidateQueries([StorageKey.isBlockaidEnabled])
  }

  return useMutation({
    mutationFn,
  })
}
