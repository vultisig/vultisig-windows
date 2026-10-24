import {
  createSiteSessionNotifier,
  siteSessionStorageKeys,
} from './notifySiteSessionChanges'

/**
 * Watches the sessions serving sites (app sessions, the current vault and the
 * stored vaults) and notifies connected tabs when a site loses its session
 * (`disconnect`), moves to another vault (`accountsChanged`), or its EVM chain
 * changes (`evmChainChanged`).
 */
export const runBackgroundEventsAgent = () => {
  const notifySiteSessionChanges = createSiteSessionNotifier()

  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'local') return

    if (!siteSessionStorageKeys.some(key => key in changes)) return

    await notifySiteSessionChanges(changes)
  })
}
