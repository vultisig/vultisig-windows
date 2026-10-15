import {
  HasSeenHomeSwipeHintStorage,
  isHasSeenHomeSwipeHintInitially,
} from '@core/ui/storage/hasSeenHomeSwipeHint'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const hasSeenHomeSwipeHintStorage: HasSeenHomeSwipeHintStorage = {
  getHasSeenHomeSwipeHint: async () =>
    persistentStorage.getItem<boolean>(StorageKey.hasSeenHomeSwipeHint) ??
    isHasSeenHomeSwipeHintInitially,
  setHasSeenHomeSwipeHint: async hasSeenHomeSwipeHint => {
    persistentStorage.setItem(
      StorageKey.hasSeenHomeSwipeHint,
      hasSeenHomeSwipeHint
    )
  },
}
