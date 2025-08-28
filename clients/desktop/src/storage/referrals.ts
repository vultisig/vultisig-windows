import {
  isHasFinishedReferralsOnboardingInitially,
  ReferralsStorage,
} from '@core/ui/storage/referrals'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

const friendKey = (vaultId: string) => `${StorageKey.friendReferral}:${vaultId}`

export const referralsStorage: ReferralsStorage = {
  getHasFinishedReferralsOnboarding: async () => {
    const v = persistentStorage.getItem<boolean>(
      StorageKey.hasFinishedReferralsOnboarding
    )
    return v === undefined ? isHasFinishedReferralsOnboardingInitially : v
  },

  setHasFinishedReferralsOnboarding: async value => {
    persistentStorage.setItem(StorageKey.hasFinishedReferralsOnboarding, value)
  },

  getFriendReferral: async (vaultId: string) => {
    const key = friendKey(vaultId)
    const v = persistentStorage.getItem<string | undefined>(key)
    if (v !== undefined) return v ?? null
    return null
  },

  setFriendReferral: async (vaultId: string, input: string) => {
    const key = friendKey(vaultId)
    persistentStorage.setItem(key, (input || '').trim())
  },
}
