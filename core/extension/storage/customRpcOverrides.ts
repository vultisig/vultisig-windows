import {
  CustomRpcOverrides,
  CustomRpcOverridesStorage,
} from '@core/ui/storage/customRpcOverrides'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

const emptyOverrides: CustomRpcOverrides = {}

export const customRpcOverridesStorage: CustomRpcOverridesStorage = {
  getCustomRpcOverrides: async () =>
    getStorageValue(StorageKey.customRpcOverrides, emptyOverrides),
  setCustomRpcOverrides: async overrides => {
    await setStorageValue(StorageKey.customRpcOverrides, overrides)
  },
}
