import {
  HasSeenHomeSwipeHintStorage,
  isHasSeenHomeSwipeHintInitially,
} from '@core/ui/storage/hasSeenHomeSwipeHint'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const hasSeenHomeSwipeHintStorage: HasSeenHomeSwipeHintStorage = {
  getHasSeenHomeSwipeHint: () =>
    getStorageValue(
      StorageKey.hasSeenHomeSwipeHint,
      isHasSeenHomeSwipeHintInitially
    ),
  setHasSeenHomeSwipeHint: async hasSeenHomeSwipeHint => {
    await setStorageValue(StorageKey.hasSeenHomeSwipeHint, hasSeenHomeSwipeHint)
  },
}
