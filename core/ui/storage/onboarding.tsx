import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBeDefined } from '@lib/utils/assert/shouldBeDefined'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isHasFinishedOnboardingInitially = false

export type SetHasFinishedOnboardingFunction = (
  hasFinishedOnboarding: boolean
) => Promise<void>

export type GetHasFinishedOnboardingFunction = () => Promise<boolean>

export type OnboardingStorage = {
  getHasFinishedOnboarding: GetHasFinishedOnboardingFunction
  setHasFinishedOnboarding: SetHasFinishedOnboardingFunction
}

export const useHasFinishedOnboardingQuery = () => {
  const { getHasFinishedOnboarding } = useCore()

  return useQuery({
    queryKey: [StorageKey.hasFinishedOnboarding],
    queryFn: getHasFinishedOnboarding,
    ...fixedDataQueryOptions,
  })
}

export const useHasFinishedOnboarding = () => {
  const { data } = useHasFinishedOnboardingQuery()

  return shouldBeDefined(data)
}

export const useSetHasFinishedOnboardingMutation = () => {
  const { setHasFinishedOnboarding } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const mutationFn: SetHasFinishedOnboardingFunction = async input => {
    await setHasFinishedOnboarding(input)
    await invalidateQueries([StorageKey.hasFinishedOnboarding])
  }

  return useMutation({
    mutationFn,
  })
}
