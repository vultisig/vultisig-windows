import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { useRemoteTssBatching } from './remoteFeatureFlags'
import { StorageKey } from './StorageKey'

export const isTssBatchingInitiallyEnabled = false

type SetIsTssBatchingEnabledFunction = (
  isTssBatchingEnabled: boolean
) => Promise<void>

type GetIsTssBatchingEnabledFunction = () => Promise<boolean>

export type TssBatchingEnabledStorage = {
  getIsTssBatchingEnabled: GetIsTssBatchingEnabledFunction
  setIsTssBatchingEnabled: SetIsTssBatchingEnabledFunction
}

export const useIsTssBatchingEnabledQuery = () => {
  const { getIsTssBatchingEnabled } = useCore()

  return useQuery({
    queryKey: [StorageKey.isTssBatchingEnabled],
    queryFn: getIsTssBatchingEnabled,
    ...noRefetchQueryOptions,
  })
}

/** Returns true if TSS batching is enabled locally or forced by the remote `tss-batching` flag. */
export const useIsTssBatchingEnabled = () => {
  const { data } = useIsTssBatchingEnabledQuery()
  const remoteTssBatching = useRemoteTssBatching()

  return remoteTssBatching || shouldBeDefined(data)
}

export const useSetIsTssBatchingEnabledMutation = () => {
  const { setIsTssBatchingEnabled } = useCore()
  const refetchQueries = useRefetchQueries()

  const mutationFn: SetIsTssBatchingEnabledFunction = async input => {
    await setIsTssBatchingEnabled(input)
    await refetchQueries([StorageKey.isTssBatchingEnabled])
  }

  return useMutation({
    mutationFn,
  })
}
