import {
  BalanceVisibilityStorage,
  isBalanceInitallyVisible,
} from '@core/ui/storage/balanceVisibility'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getPersistentState } from '@lib/ui/state/persistent/getPersistentState'
import { setPersistentState } from '@lib/ui/state/persistent/setPersistentState'

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
