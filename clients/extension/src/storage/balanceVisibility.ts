import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import {
  BalanceVisibilityStorage,
  isBalanceInitallyVisible,
} from '@core/ui/storage/balanceVisibility'
import { StorageKey } from '@core/ui/storage/StorageKey'

export const balanceVisibilityStorage: BalanceVisibilityStorage = {
  getIsBalanceVisible: async () => {
    return getPersistentState(
      StorageKey.isBalanceVisible,
      isBalanceInitallyVisible
    )
  },
  setIsBalanceVisible: async isBalanceVisible => {
    await setPersistentState(StorageKey.isBalanceVisible, isBalanceVisible)
  },
}
