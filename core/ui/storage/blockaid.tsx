import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { attempt } from '@lib/utils/attempt'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isBlockaidInitiallyEnabled = true

type SetBlockaidEnabledFunction = (input: boolean) => Promise<void>

type GetBlockaidEnabledFunction = () => Promise<boolean>

export type BlockaidStorage = {
  getBlockaidEnabled: GetBlockaidEnabledFunction
  setBlockaidEnabled: SetBlockaidEnabledFunction
}

export const useBlockaidEnabledQuery = () => {
  const { getBlockaidEnabled, setBlockaidEnabled } = useCore()

  return useQuery({
    queryKey: [StorageKey.blockaidEnabled],
    queryFn: async () => {
      const result = await getBlockaidEnabled()
      // If the setting doesn't exist, initialize it with the default value
      if (result === null || result === undefined) {
        await setBlockaidEnabled(isBlockaidInitiallyEnabled)
        return isBlockaidInitiallyEnabled
      }
      return result
    },
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
    // Validate input
    if (typeof input !== 'boolean') {
      throw new Error('Blockaid enabled must be a boolean value')
    }

    const result = await attempt(async () => {
      await setBlockaidEnabled(input)
      await invalidateQueries([StorageKey.blockaidEnabled])
    })

    if ('error' in result) {
      throw new Error(`Failed to update blockaid setting: ${result.error}`)
    }
  }

  return useMutation({
    mutationFn,
  })
}
