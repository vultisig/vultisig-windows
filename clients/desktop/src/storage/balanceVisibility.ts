import {
  BalanceVisibilityStorage,
  isBalanceInitallyVisible,
} from '@core/ui/storage/balanceVisibility'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const balanceVisibilityStorage: BalanceVisibilityStorage = {
  getIsBalanceVisible: async () => {
    const value = persistentStorage.getItem<boolean>(
      StorageKey.isBalanceVisible
    )

    if (value === undefined) {
      return isBalanceInitallyVisible
    }

    return value
  },
  setIsBalanceVisible: async isBalanceVisible => {
    persistentStorage.setItem(StorageKey.isBalanceVisible, isBalanceVisible)
  },
}
