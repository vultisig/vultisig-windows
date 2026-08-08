import {
  CustomRpcOverrides,
  CustomRpcOverridesStorage,
} from '@core/ui/storage/customRpcOverrides'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const customRpcOverridesStorage: CustomRpcOverridesStorage = {
  getCustomRpcOverrides: async () =>
    persistentStorage.getItem<CustomRpcOverrides>(
      StorageKey.customRpcOverrides
    ) ?? {},
  setCustomRpcOverrides: async overrides => {
    persistentStorage.setItem(StorageKey.customRpcOverrides, overrides)
  },
}
