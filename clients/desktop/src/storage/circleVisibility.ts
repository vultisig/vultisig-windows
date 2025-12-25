import {
  CircleVisibilityStorage,
  isCircleInitiallyVisible,
} from '@core/ui/storage/circleVisibility'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const circleVisibilityStorage: CircleVisibilityStorage = {
  getIsCircleVisible: async () => {
    const value = persistentStorage.getItem<boolean>(StorageKey.isCircleVisible)

    if (value === undefined) {
      return isCircleInitiallyVisible
    }

    return value
  },
  setIsCircleVisible: async isCircleVisible => {
    persistentStorage.setItem(StorageKey.isCircleVisible, isCircleVisible)
  },
}
