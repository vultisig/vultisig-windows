import {
  BondRewardHistoryStorage,
  SavedBondRewardHistories,
} from '@core/ui/storage/bondRewardHistory'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const bondRewardHistoryStorage: BondRewardHistoryStorage = {
  getBondRewardHistories: async () =>
    persistentStorage.getItem<SavedBondRewardHistories>(
      StorageKey.bondRewardHistory
    ) ?? {},
  setBondRewardHistories: async histories => {
    persistentStorage.setItem(StorageKey.bondRewardHistory, histories)
  },
}
