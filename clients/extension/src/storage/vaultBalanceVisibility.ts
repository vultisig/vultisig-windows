import { isVaultBalanceVisibleQueryKey } from '@core/ui/query/keys'
import {
  GetIsVaultBalanceVisibleFunction,
  isVaultBalanceInitallyVisible,
  SetIsVaultBalanceVisibleFunction,
} from '@core/ui/storage/CoreStorage'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

const [key] = isVaultBalanceVisibleQueryKey

export const getIsVaultBalanceVisible: GetIsVaultBalanceVisibleFunction =
  async () => {
    return getPersistentState(key, isVaultBalanceInitallyVisible)
  }

export const setIsVaultBalanceVisible: SetIsVaultBalanceVisibleFunction =
  async isVaultBalanceVisible => {
    await setPersistentState(key, isVaultBalanceVisible)
  }
