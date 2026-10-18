import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'
import { shouldBeDefined } from '@vultisig/lib-utils/assert/shouldBeDefined'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

/** `separate`: each tab shows its own total; `combined`: wallet plus DeFi on both. */
export const homeDisplays = ['separate', 'combined'] as const

export type HomeDisplay = (typeof homeDisplays)[number]

/** The home display for fresh installs and for users who never picked one. */
export const defaultHomeDisplay: HomeDisplay = 'separate'

type GetHomeDisplayFunction = () => Promise<HomeDisplay>

type SetHomeDisplayFunction = (value: HomeDisplay) => Promise<void>

/** Per-platform persistence of {@link HomeDisplay}. */
export type HomeDisplayStorage = {
  getHomeDisplay: GetHomeDisplayFunction
  setHomeDisplay: SetHomeDisplayFunction
}

/** Reads the stored home display; part of the storage gate at startup. */
export const useHomeDisplayQuery = () => {
  const { getHomeDisplay } = useCore()

  return useQuery({
    queryKey: [StorageKey.homeDisplay],
    queryFn: getHomeDisplay,
    ...noRefetchQueryOptions,
  })
}

/** The current home display. Only valid below the startup storage gate. */
export const useHomeDisplay = () => {
  const { data } = useHomeDisplayQuery()

  return shouldBeDefined(data)
}

/** Persists a new home display and refreshes every reader. */
export const useSetHomeDisplayMutation = () => {
  const { setHomeDisplay } = useCore()
  const refetchQueries = useRefetchQueries()

  return useMutation({
    mutationFn: async (value: HomeDisplay) => {
      await setHomeDisplay(value)
      await refetchQueries([StorageKey.homeDisplay])
    },
  })
}
