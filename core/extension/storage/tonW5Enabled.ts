import { StorageKey } from '@core/ui/storage/StorageKey'
import {
  isTonW5InitiallyEnabled,
  TonW5EnabledStorage,
} from '@core/ui/storage/tonW5Enabled'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const tonW5EnabledStorage: TonW5EnabledStorage = {
  getIsTonW5Enabled: async () => {
    return getStorageValue(StorageKey.isTonW5Enabled, isTonW5InitiallyEnabled)
  },
  setIsTonW5Enabled: async isTonW5Enabled => {
    await setStorageValue(StorageKey.isTonW5Enabled, isTonW5Enabled)
  },
}
