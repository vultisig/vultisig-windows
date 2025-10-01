import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const isHasFinishedReferralsOnboardingInitially = false

type GetFriendReferralFn = (vaultId: string) => Promise<string | null>
type SetFriendReferralFn = (vaultId: string, input: string) => Promise<void>

type SetHasFinishedReferralsOnboardingFunction = (
  hasFinishedOnboarding: boolean
) => Promise<void>

type GetHasFinishedReferralsOnboardingFunction = () => Promise<boolean>

export type ReferralsStorage = {
  getHasFinishedReferralsOnboarding: GetHasFinishedReferralsOnboardingFunction
  setHasFinishedReferralsOnboarding: SetHasFinishedReferralsOnboardingFunction
  getFriendReferral: GetFriendReferralFn
  setFriendReferral: SetFriendReferralFn
}

export const useFriendReferralQuery = (vaultId: string) => {
  const { getFriendReferral } = useCore()
  return useQuery({
    queryKey: [StorageKey.friendReferral, vaultId],
    queryFn: () => getFriendReferral(vaultId),
    ...noRefetchQueryOptions,
  })
}

export const useHasFinishedReferralsOnboardingQuery = () => {
  const { getHasFinishedReferralsOnboarding } = useCore()

  return useQuery({
    queryKey: [StorageKey.hasFinishedReferralsOnboarding],
    queryFn: getHasFinishedReferralsOnboarding,
    ...noRefetchQueryOptions,
  })
}

export const useSetFriendReferralMutation = (vaultId: string) => {
  const { setFriendReferral } = useCore()
  const invalidate = useInvalidateQueries()
  return useMutation({
    mutationFn: async (input: string) => {
      await setFriendReferral(vaultId, input)
      await invalidate([StorageKey.friendReferral, vaultId])
    },
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
