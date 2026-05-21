import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { shouldBeDefined } from '@vultisig/lib-utils/assert/shouldBeDefined'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

type GetIsMLDSAEnabledFunction = () => Promise<boolean>

export type MLDSAEnabledStorage = {
  getIsMLDSAEnabled: GetIsMLDSAEnabledFunction
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
