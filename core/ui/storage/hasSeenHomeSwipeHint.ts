import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isHasSeenHomeSwipeHintInitially = false

type GetHasSeenHomeSwipeHintFunction = () => Promise<boolean>
type SetHasSeenHomeSwipeHintFunction = (
  hasSeenHomeSwipeHint: boolean
) => Promise<void>

/** Per-platform persistence of whether the home swipe hint was dismissed. */
export type HasSeenHomeSwipeHintStorage = {
  getHasSeenHomeSwipeHint: GetHasSeenHomeSwipeHintFunction
  setHasSeenHomeSwipeHint: SetHasSeenHomeSwipeHintFunction
}

/** Reads whether the one-time home swipe hint has been dismissed. */
export const useHasSeenHomeSwipeHintQuery = () => {
  const { getHasSeenHomeSwipeHint } = useCore()

  return useQuery({
    queryKey: [StorageKey.hasSeenHomeSwipeHint],
    queryFn: getHasSeenHomeSwipeHint,
    ...noRefetchQueryOptions,
  })
}

/** Marks the home swipe hint as seen for good. */
export const useMarkHomeSwipeHintSeen = () => {
  const { setHasSeenHomeSwipeHint } = useCore()
  const refetchQueries = useRefetchQueries()

  const { mutate } = useMutation({
    mutationFn: async () => {
      await setHasSeenHomeSwipeHint(true)
      await refetchQueries([StorageKey.hasSeenHomeSwipeHint])
    },
  })

  return () => mutate()
}
