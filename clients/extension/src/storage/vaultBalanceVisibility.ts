import {
  GetIsVaultBalanceVisibleFunction,
  isVaultBalanceInitallyVisible,
  SetIsVaultBalanceVisibleFunction,
} from '@core/ui/storage/CoreStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const getIsVaultBalanceVisible: GetIsVaultBalanceVisibleFunction =
  async () => {
    return getPersistentState(
      StorageKey.isVaultBalanceVisible,
      isVaultBalanceInitallyVisible
    )
  }

export const setIsVaultBalanceVisible: SetIsVaultBalanceVisibleFunction =
  async isVaultBalanceVisible => {
    await setPersistentState(
      StorageKey.isVaultBalanceVisible,
      isVaultBalanceVisible
    )
  }
