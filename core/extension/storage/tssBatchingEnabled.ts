import { StorageKey } from '@core/ui/storage/StorageKey'
import {
  isTssBatchingInitiallyEnabled,
  TssBatchingEnabledStorage,
} from '@core/ui/storage/tssBatchingEnabled'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const tssBatchingEnabledStorage: TssBatchingEnabledStorage = {
  getIsTssBatchingEnabled: async () => {
    return getStorageValue(
      StorageKey.isTssBatchingEnabled,
      isTssBatchingInitiallyEnabled
    )
  },
  setIsTssBatchingEnabled: async isTssBatchingEnabled => {
    await setStorageValue(StorageKey.isTssBatchingEnabled, isTssBatchingEnabled)
  },
}
