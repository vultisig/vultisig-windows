import { storage } from '@core/extension/storage'
import { VaultsAppSessions } from '@core/extension/storage/appSessions'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { without } from '@vultisig/lib-utils/array/without'

import { getEvmChainChangedEvents } from './getEvmChainChangedEvents'
import { sendEventToApp } from './sendEventToApp'

/**
 * Watches the current vault's app sessions and notifies connected tabs when
 * a session is removed (`disconnect`) or its EVM chain changes
 * (`evmChainChanged`).
 */
export const runBackgroundEventsAgent = () => {
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'local') return

    if (!(StorageKey.appSessions in changes)) return

    const { newValue, oldValue } = changes[StorageKey.appSessions] as {
      newValue?: VaultsAppSessions
      oldValue: VaultsAppSessions
    }

    if (!oldValue) return

    const currentVaultId = await storage.getCurrentVaultId()
    if (!currentVaultId) return

    const prevSessions = oldValue[currentVaultId] ?? {}
    const nextSessions = newValue?.[currentVaultId] ?? {}

    const prevApps = Object.keys(prevSessions)
    const nextApps = Object.keys(nextSessions)

    const removedApps = without(prevApps, ...nextApps)

    for (const appId of removedApps) {
      sendEventToApp({ appId, event: 'disconnect', value: undefined })
    }

    for (const { appId, chainId } of getEvmChainChangedEvents({
      prevSessions,
      nextSessions,
    })) {
      sendEventToApp({ appId, event: 'evmChainChanged', value: chainId })
    }
  })
}
