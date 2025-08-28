import { isHasFinishedOnboardingInitially } from '@core/ui/storage/onboarding'
import { ReferralsStorage } from '@core/ui/storage/referrals'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

const friendKey = (vaultId: string) => `${StorageKey.friendReferral}:${vaultId}`

export const referralsStorage: ReferralsStorage = {
  getHasFinishedReferralsOnboarding: async () => {
    return getStorageValue(
      StorageKey.hasFinishedReferralsOnboarding,
      isHasFinishedOnboardingInitially
    )
  },

  setHasFinishedReferralsOnboarding: async value => {
    await setStorageValue(StorageKey.hasFinishedReferralsOnboarding, value)
  },

  getFriendReferral: async (vaultId: string) => {
    const key = friendKey(vaultId)
    const current = await getStorageValue<string | null>(key, null)
    if (current !== null) return current
    return null
  },

  setFriendReferral: async (vaultId: string, input: string) => {
    const key = friendKey(vaultId)
    await setStorageValue(key, (input || '').trim())
  },
}
