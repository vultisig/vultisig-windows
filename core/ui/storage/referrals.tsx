import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isHasFinishedReferralsOnboardingInitially = false

type SetHasFinishedReferralsOnboardingFunction = (
  hasFinishedOnboarding: boolean
) => Promise<void>

type GetHasFinishedReferralsOnboardingFunction = () => Promise<boolean>

export type ReferralsOnboardingStorage = {
  getHasFinishedReferralsOnboarding: GetHasFinishedReferralsOnboardingFunction
  setHasFinishedReferralsOnboarding: SetHasFinishedReferralsOnboardingFunction
}

export const useHasFinishedReferralsOnboardingQuery = () => {
  const { getHasFinishedReferralsOnboarding } = useCore()

  return useQuery({
    queryKey: [StorageKey.hasFinishedReferralsOnboarding],
    queryFn: getHasFinishedReferralsOnboarding,
    ...noRefetchQueryOptions,
    ...noPersistQueryOptions,
  })
}

export const useSetHasFinishedReferralsOnboardingMutation = () => {
  const { setHasFinishedReferralsOnboarding } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const mutationFn: SetHasFinishedReferralsOnboardingFunction = async input => {
    await setHasFinishedReferralsOnboarding(input)
    await invalidateQueries([StorageKey.hasFinishedReferralsOnboarding])
  }

  return useMutation({
    mutationFn,
  })
}
