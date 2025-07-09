import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isBlockaidInitiallyEnabled = true

type SetBlockaidEnabledFunction = (blockaidEnabled: boolean) => Promise<void>

type GetBlockaidEnabledFunction = () => Promise<boolean>

export type BlockaidStorage = {
  getBlockaidEnabled: GetBlockaidEnabledFunction
  setBlockaidEnabled: SetBlockaidEnabledFunction
}

export const useBlockaidEnabledQuery = () => {
  const { getBlockaidEnabled } = useCore()

  return useQuery({
    queryKey: [StorageKey.blockaidEnabled],
    queryFn: getBlockaidEnabled,
    ...noRefetchQueryOptions,
    ...noPersistQueryOptions,
  })
}

export const useBlockaidEnabled = () => {
  const { data } = useBlockaidEnabledQuery()

  return shouldBeDefined(data)
}

export const useSetBlockaidEnabledMutation = () => {
  const { setBlockaidEnabled } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const mutationFn: SetBlockaidEnabledFunction = async input => {
    await setBlockaidEnabled(input)
    await invalidateQueries([StorageKey.blockaidEnabled])
  }

  return useMutation({
    mutationFn,
  })
} 