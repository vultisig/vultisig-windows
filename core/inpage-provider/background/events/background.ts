import { storage } from '@core/extension/storage'
import { VaultsAppSessions } from '@core/extension/storage/appSessions'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { without } from '@vultisig/lib-utils/array/without'

import { getEvmChainChangedEvents } from './getEvmChainChangedEvents'
import { createVaultSwitchNotifier } from './notifyVaultSwitch'
import { sendEventToApp } from './sendEventToApp'

/**
 * Watches the current vault and its app sessions and notifies connected tabs
 * when a session is removed (`disconnect`), its EVM chain changes
 * (`evmChainChanged`), or the current vault is switched (`disconnect` for
 * apps only the previous vault was connected to, `accountsChanged` for apps
 * connected to the new one).
 */
export const runBackgroundEventsAgent = () => {
  const notifyVaultSwitch = createVaultSwitchNotifier()

  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'local') return

    if (StorageKey.currentVaultId in changes) {
      const { oldValue } = changes[StorageKey.currentVaultId] as {
        oldValue?: CurrentVaultId
      }

      await notifyVaultSwitch({ prevVaultId: oldValue ?? null })
    }

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
