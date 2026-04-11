import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isHasSeenNotificationPromptInitially = false

type GetHasSeenNotificationPromptFunction = () => Promise<boolean>
type SetHasSeenNotificationPromptFunction = (
  hasSeenNotificationPrompt: boolean
) => Promise<void>

export type HasSeenNotificationPromptStorage = {
  getHasSeenNotificationPrompt: GetHasSeenNotificationPromptFunction
  setHasSeenNotificationPrompt: SetHasSeenNotificationPromptFunction
}

export const useHasSeenNotificationPromptQuery = () => {
  const { getHasSeenNotificationPrompt } = useCore()

  return useQuery({
    queryKey: [StorageKey.hasSeenNotificationPrompt],
    queryFn: getHasSeenNotificationPrompt,
    ...noRefetchQueryOptions,
  })
}

const useSetHasSeenNotificationPromptMutation = () => {
  const { setHasSeenNotificationPrompt } = useCore()
  const refetchQueries = useRefetchQueries()

  const mutationFn: SetHasSeenNotificationPromptFunction = async input => {
    await setHasSeenNotificationPrompt(input)
    await refetchQueries([StorageKey.hasSeenNotificationPrompt])
  }

  return useMutation({
    mutationFn,
  })
}

export const useHasSeenNotificationPrompt = () => {
  const { data } = useHasSeenNotificationPromptQuery()
  const { mutateAsync } = useSetHasSeenNotificationPromptMutation()

  const value = data ?? isHasSeenNotificationPromptInitially

  const setValue = (next: boolean) => mutateAsync(next)

  return [value, setValue] as const
}
