import { removeStorageValue } from '@lib/extension/storage/remove'

import { removePersistedHistory } from '../storage/persistedView'

// Older versions kept the expanded-tab handoff view here, in local storage.
const legacyInitialViewKey = 'initialView'

/**
 * Clears navigation state saved by the previous version when the extension
 * updates. Older builds persisted full view state, and stored view shapes can
 * drift between versions.
 */
export const registerNavigationStateCleanup = (): void => {
  chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason !== 'update') {
      return
    }

    Promise.all([
      removePersistedHistory(),
      removeStorageValue(legacyInitialViewKey),
    ]).catch(console.error)
  })
}
