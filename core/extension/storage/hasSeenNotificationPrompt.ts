import {
  HasSeenNotificationPromptStorage,
  isHasSeenNotificationPromptInitially,
} from '@core/ui/storage/hasSeenNotificationPrompt'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const hasSeenNotificationPromptStorage: HasSeenNotificationPromptStorage =
  {
    getHasSeenNotificationPrompt: async () => {
      return getStorageValue(
        StorageKey.hasSeenNotificationPrompt,
        isHasSeenNotificationPromptInitially
      )
    },
    setHasSeenNotificationPrompt: async hasSeenNotificationPrompt => {
      await setStorageValue(
        StorageKey.hasSeenNotificationPrompt,
        hasSeenNotificationPrompt
      )
    },
  }
