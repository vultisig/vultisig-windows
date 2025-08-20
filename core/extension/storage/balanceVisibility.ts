import {
  BalanceVisibilityStorage,
  isBalanceInitallyVisible,
} from '@core/ui/storage/balanceVisibility'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const balanceVisibilityStorage: BalanceVisibilityStorage = {
  getIsBalanceVisible: async () => {
    return getStorageValue(
      StorageKey.isBalanceVisible,
      isBalanceInitallyVisible
    )
  },
  setIsBalanceVisible: async isBalanceVisible => {
    await setStorageValue(StorageKey.isBalanceVisible, isBalanceVisible)
  },
}
