import { storage } from '@core/extension/storage'
import {
  getVaultAppSessions,
  VaultsAppSessions,
} from '@core/extension/storage/appSessions'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { without } from '@vultisig/lib-utils/array/without'

import { getEvmChainChangedEvents } from './getEvmChainChangedEvents'
import { getVaultSwitchEvents } from './getVaultSwitchEvents'
import { sendEventToApp } from './sendEventToApp'

const getVaultSessions = async (vaultId: CurrentVaultId | undefined) =>
  vaultId ? getVaultAppSessions(vaultId) : {}

/**
 * Watches the current vault and its app sessions and notifies connected tabs
 * when a session is removed (`disconnect`), its EVM chain changes
 * (`evmChainChanged`), or the current vault is switched (`disconnect` for
 * apps only the previous vault was connected to, `accountsChanged` for apps
 * connected to the new one).
 */
export const runBackgroundEventsAgent = () => {
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'local') return

    if (StorageKey.currentVaultId in changes) {
      const { newValue, oldValue } = changes[StorageKey.currentVaultId] as {
        newValue?: CurrentVaultId
        oldValue?: CurrentVaultId
      }

      if (oldValue && newValue !== oldValue) {
        const [prevVaultSessions, nextVaultSessions] = await Promise.all([
          getVaultSessions(oldValue),
          getVaultSessions(newValue),
        ])

        const { disconnect, accountsChanged } = getVaultSwitchEvents({
          prevVaultSessions,
          nextVaultSessions,
        })

        for (const appId of disconnect) {
          sendEventToApp({ appId, event: 'disconnect', value: undefined })
        }

        for (const appId of accountsChanged) {
          sendEventToApp({ appId, event: 'accountsChanged', value: undefined })
        }
      }
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
