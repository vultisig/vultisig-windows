import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isHasFinishedReferralsOnboardingInitially = false

type GetHasAddedFriendReferralFunction = () => Promise<string | null>
type SetHasAddedFriendReferralFunction = (input: string) => Promise<void>

type SetHasFinishedReferralsOnboardingFunction = (
  hasFinishedOnboarding: boolean
) => Promise<void>

type GetHasFinishedReferralsOnboardingFunction = () => Promise<boolean>

export type ReferralsStorage = {
  getHasFinishedReferralsOnboarding: GetHasFinishedReferralsOnboardingFunction
  setHasFinishedReferralsOnboarding: SetHasFinishedReferralsOnboardingFunction
  getFriendReferral: GetHasAddedFriendReferralFunction
  setFriendReferral: SetHasAddedFriendReferralFunction
}

export const useFriendReferralQuery = () => {
  const { getFriendReferral } = useCore()

  return useQuery({
    queryKey: [StorageKey.hasAddedFriendReferral],
    queryFn: getFriendReferral,
    ...noRefetchQueryOptions,
    ...noPersistQueryOptions,
  })
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

export const useSetFriendReferralMutation = () => {
  const { setFriendReferral } = useCore()
  const invalidateQueries = useInvalidateQueries()

  const mutationFn: SetHasAddedFriendReferralFunction = async input => {
    await setFriendReferral(input)
    await invalidateQueries([StorageKey.hasAddedFriendReferral])
  }

  return useMutation({
    mutationFn,
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
