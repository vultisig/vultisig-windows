import {
  BondRewardHistoryStorage,
  SavedBondRewardHistories,
} from '@core/ui/storage/bondRewardHistory'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

const emptyHistories: SavedBondRewardHistories = {}

export const bondRewardHistoryStorage: BondRewardHistoryStorage = {
  getBondRewardHistories: async () =>
    getStorageValue(StorageKey.bondRewardHistory, emptyHistories),
  setBondRewardHistories: async histories => {
    await setStorageValue(StorageKey.bondRewardHistory, histories)
  },
}
