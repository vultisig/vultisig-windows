import { DismissedBannersStorage } from '@core/ui/storage/dismissedBanners'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const dismissedBannersStorage: DismissedBannersStorage = {
  getDismissedBanners: async () => {
    return getStorageValue(StorageKey.dismissedBanners, [])
  },
  setDismissedBanners: async banners => {
    await setStorageValue(StorageKey.dismissedBanners, banners)
  },
}
