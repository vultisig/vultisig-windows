import {
  HasSeenNotificationPromptStorage,
  isHasSeenNotificationPromptInitially,
} from '@core/ui/storage/hasSeenNotificationPrompt'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const hasSeenNotificationPromptStorage: HasSeenNotificationPromptStorage =
  {
    getHasSeenNotificationPrompt: async () => {
      const value = persistentStorage.getItem<boolean>(
        StorageKey.hasSeenNotificationPrompt
      )

      if (value === undefined) {
        return isHasSeenNotificationPromptInitially
      }

      return value
    },
    setHasSeenNotificationPrompt: async hasSeenNotificationPrompt => {
      persistentStorage.setItem(
        StorageKey.hasSeenNotificationPrompt,
        hasSeenNotificationPrompt
      )
    },
  }
