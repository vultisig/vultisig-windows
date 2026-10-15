import {
  defaultHomeDisplay,
  HomeDisplayStorage,
} from '@core/ui/storage/homeDisplay'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const homeDisplayStorage: HomeDisplayStorage = {
  getHomeDisplay: () =>
    getStorageValue(StorageKey.homeDisplay, defaultHomeDisplay),
  setHomeDisplay: async value => {
    await setStorageValue(StorageKey.homeDisplay, value)
  },
}
