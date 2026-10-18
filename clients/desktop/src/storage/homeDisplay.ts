import {
  defaultHomeDisplay,
  HomeDisplay,
  HomeDisplayStorage,
} from '@core/ui/storage/homeDisplay'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const homeDisplayStorage: HomeDisplayStorage = {
  getHomeDisplay: async () =>
    persistentStorage.getItem<HomeDisplay>(StorageKey.homeDisplay) ??
    defaultHomeDisplay,
  setHomeDisplay: async value => {
    persistentStorage.setItem(StorageKey.homeDisplay, value)
  },
}
