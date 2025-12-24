import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'

import { featureFlags } from '../featureFlags'
import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isCircleInitiallyVisible = true

type SetIsCircleVisibleFunction = (isVisible: boolean) => Promise<void>
type GetIsCircleVisibleFunction = () => Promise<boolean>

export type CircleVisibilityStorage = {
  getIsCircleVisible: GetIsCircleVisibleFunction
  setIsCircleVisible: SetIsCircleVisibleFunction
}

const useIsCircleVisibleQuery = () => {
  const { getIsCircleVisible } = useCore()

  return useQuery({
    queryKey: [StorageKey.isCircleVisible],
    queryFn: getIsCircleVisible,
    ...noRefetchQueryOptions,
  })
}

export const useIsCircleVisible = () => {
  const { data } = useIsCircleVisibleQuery()

  if (!featureFlags.circle) {
    return false
  }

  return data ?? isCircleInitiallyVisible
}

export const useToggleCircleVisibility = () => {
  const { setIsCircleVisible } = useCore()
  const invalidateQueries = useInvalidateQueries()
  const isVisible = useIsCircleVisible()

  const { mutate, isPending } = useMutation({
    mutationFn: async (newValue: boolean) => {
      await setIsCircleVisible(newValue)
      await invalidateQueries([StorageKey.isCircleVisible])
    },
  })

  const toggle = () => {
    mutate(!isVisible)
  }

  return { toggle, isPending }
}
