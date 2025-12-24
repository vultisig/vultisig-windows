import {
  CircleVisibilityStorage,
  isCircleInitiallyVisible,
} from '@core/ui/storage/circleVisibility'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const circleVisibilityStorage: CircleVisibilityStorage = {
  getIsCircleVisible: async () => {
    return getStorageValue(StorageKey.isCircleVisible, isCircleInitiallyVisible)
  },
  setIsCircleVisible: async isCircleVisible => {
    await setStorageValue(StorageKey.isCircleVisible, isCircleVisible)
  },
}
