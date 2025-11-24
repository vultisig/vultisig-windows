import {
  BannerId,
  DismissedBannersStorage,
} from '@core/ui/storage/dismissedBanners'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const dismissedBannersStorage: DismissedBannersStorage = {
  getDismissedBanners: async () => {
    const value = persistentStorage.getItem<BannerId[]>(
      StorageKey.dismissedBanners
    )

    if (value === undefined) {
      return []
    }

    return value
  },
  setDismissedBanners: async banners => {
    persistentStorage.setItem(StorageKey.dismissedBanners, banners)
  },
}
