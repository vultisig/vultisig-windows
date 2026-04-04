import { handleKeysignWsNotification } from '@core/ui/notifications/handleKeysignWsNotification'
import {
  buildKeysignNotificationWebSocketUrl,
  clearWebSocketHandlers,
  keysignNotificationWsInitialReconnectDelayMs,
  keysignNotificationWsMaxReconnectDelayMs,
  parseKeysignWsNotification,
} from '@core/ui/notifications/keysignNotificationWebSocket'
import { useNotificationBanner } from '@core/ui/notifications/NotificationBannerProvider'
import { pushNotificationServerUrl } from '@core/ui/notifications/pushNotificationServerUrl'
import { useVaults } from '@core/ui/storage/vaults'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useNavigation } from '@lib/ui/navigation/state'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { computeNotificationVaultId } from '@vultisig/sdk'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import {
  getPushNotificationRegistrations,
  getPushServerUrl,
  isVaultRegisteredForPush,
  pushNotificationRegistrationsStorageKey,
} from './pushNotificationStorage'

type ManagedExtensionNotificationSocket = {
  activeWsUrl: string | null
  partyName: string
  reconnectTimer: ReturnType<typeof setTimeout> | undefined
  ws: WebSocket | null
}

/**
 * WebSocket client for opted-in vaults (same server stream as desktop). Shows the
 * in-app keysign banner when the extension UI is open; push is still handled by
 * the service worker when the UI is closed.
 */
export const ExtensionNotificationManager = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showBanner } = useNotificationBanner()
  const vaults = useVaults()
  const [{ history }] = useNavigation()

  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const showBannerRef = useRef(showBanner)
  showBannerRef.current = showBanner

  const tRef = useRef(t)
  tRef.current = t

  const historyRef = useRef(history)
  historyRef.current = history

  const vaultBannerMetaRef = useRef(new Map<string, { isFastVault: boolean }>())

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const next = new Map<string, { isFastVault: boolean }>()
      for (const vault of vaults) {
        if (!vault.hexChainCode) {
          continue
        }
        const vaultId = await computeNotificationVaultId(
          vault.publicKeys.ecdsa,
          vault.hexChainCode
        )
        if (cancelled) {
          return
        }
        next.set(vaultId, { isFastVault: hasServer(vault.signers) })
      }
      if (!cancelled) {
        vaultBannerMetaRef.current = next
      }
    })()

    return () => {
      cancelled = true
    }
  }, [vaults])

  const connectionsRef = useRef<
    Map<string, ManagedExtensionNotificationSocket>
  >(new Map())
  const reconnectDelayMsRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const connectionsMap = connectionsRef.current

    const getTokenJson = async (): Promise<string | null> => {
      try {
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.getSubscription()
        return sub ? JSON.stringify(sub.toJSON()) : null
      } catch {
        return null
      }
    }

    const handleNotificationMessage = async (
      msg: NonNullable<ReturnType<typeof parseKeysignWsNotification>>,
      ws: WebSocket,
      vaultId: string,
      localPartyName: string
    ) => {
      const navigateToKeysign = () => {
        navigateRef.current({
          id: 'deeplink',
          state: { url: msg.qr_code_data },
        })
      }

      await handleKeysignWsNotification({
        msg,
        ws,
        vaultId,
        localPartyName,
        t: tRef.current,
        topView: getLastItem(historyRef.current),
        vaultBannerMeta: vaultBannerMetaRef.current,
        navigateToKeysign,
        showBanner: showBannerRef.current,
        bringAppToFront: () => {
          window.focus()
        },
        showOsNotification: ({ title, body, onClick }) => {
          if (
            typeof Notification === 'undefined' ||
            Notification.permission !== 'granted'
          ) {
            return
          }
          const osNotification = new Notification(title, { body })
          osNotification.onclick = () => {
            window.focus()
            onClick()
          }
        },
      })
    }

    const disconnectVault = (vaultId: string) => {
      const managed = connectionsRef.current.get(vaultId)
      if (!managed) return
      if (managed.reconnectTimer !== undefined) {
        clearTimeout(managed.reconnectTimer)
        managed.reconnectTimer = undefined
      }
      connectionsRef.current.delete(vaultId)
      delete reconnectDelayMsRef.current[vaultId]
      if (managed.ws) {
        const ws = managed.ws
        clearWebSocketHandlers(ws)
        managed.ws = null
        managed.activeWsUrl = null
        ws.close()
      }
    }

    const connectVault = async (vaultId: string, partyName: string) => {
      const token = await getTokenJson()
      if (!token) {
        return
      }

      const baseUrl = (await getPushServerUrl()) ?? pushNotificationServerUrl

      let managed = connectionsRef.current.get(vaultId)
      if (!managed) {
        managed = {
          activeWsUrl: null,
          partyName,
          reconnectTimer: undefined,
          ws: null,
        }
        connectionsRef.current.set(vaultId, managed)
      }
      managed.partyName = partyName

      if (managed.reconnectTimer !== undefined) {
        clearTimeout(managed.reconnectTimer)
        managed.reconnectTimer = undefined
      }

      const url = buildKeysignNotificationWebSocketUrl({
        baseUrl,
        vaultId,
        partyName: managed.partyName,
        token,
      })

      const existingWs = managed.ws
      if (
        existingWs &&
        (existingWs.readyState === WebSocket.CONNECTING ||
          existingWs.readyState === WebSocket.OPEN) &&
        managed.activeWsUrl === url
      ) {
        return
      }

      if (existingWs) {
        clearWebSocketHandlers(existingWs)
        existingWs.close()
        managed.ws = null
        managed.activeWsUrl = null
      }

      const ws = new WebSocket(url)
      managed.ws = ws
      managed.activeWsUrl = url

      ws.onopen = () => {
        reconnectDelayMsRef.current[vaultId] =
          keysignNotificationWsInitialReconnectDelayMs
      }

      ws.onmessage = event => {
        if (typeof event.data !== 'string') return
        let parsed: unknown
        try {
          parsed = JSON.parse(event.data)
        } catch {
          return
        }

        const notification = parseKeysignWsNotification(parsed)
        if (!notification) {
          return
        }

        void handleNotificationMessage(
          notification,
          ws,
          vaultId,
          managed.partyName
        ).catch(error => {
          console.warn(
            '[ExtensionNotificationManager] handle message failed',
            error
          )
        })
      }

      ws.onerror = event => {
        console.debug('[ExtensionNotificationManager] WebSocket error', event)
      }

      ws.onclose = () => {
        const entry = connectionsRef.current.get(vaultId)
        if (!entry) {
          return
        }
        entry.ws = null
        entry.activeWsUrl = null

        void (async () => {
          const stillRegistered = await isVaultRegisteredForPush(vaultId)
          if (!stillRegistered) {
            return
          }

          const prevDelay =
            reconnectDelayMsRef.current[vaultId] ??
            keysignNotificationWsInitialReconnectDelayMs
          const jitterMs = Math.random() * prevDelay * 0.5
          entry.reconnectTimer = setTimeout(() => {
            entry.reconnectTimer = undefined
            void connectVault(vaultId, entry.partyName)
          }, prevDelay + jitterMs)
          reconnectDelayMsRef.current[vaultId] = Math.min(
            prevDelay * 2,
            keysignNotificationWsMaxReconnectDelayMs
          )
        })()
      }
    }

    const syncRegistrations = () => {
      void (async () => {
        const registrations = await getPushNotificationRegistrations()
        const activeVaultIds = new Set(Object.keys(registrations))

        for (const vaultId of connectionsRef.current.keys()) {
          if (!activeVaultIds.has(vaultId)) {
            disconnectVault(vaultId)
          }
        }

        const token = await getTokenJson()
        if (!token) {
          for (const vaultId of connectionsRef.current.keys()) {
            disconnectVault(vaultId)
          }
          return
        }

        for (const [vaultId, reg] of Object.entries(registrations)) {
          await connectVault(vaultId, reg.partyName)
        }
      })()
    }

    syncRegistrations()

    const onChromeStorageChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area !== 'local') return
      if (!(pushNotificationRegistrationsStorageKey in changes)) return
      syncRegistrations()
    }

    chrome.storage.onChanged.addListener(onChromeStorageChanged)

    return () => {
      chrome.storage.onChanged.removeListener(onChromeStorageChanged)
      const vaultIdsAtUnmount = [...connectionsMap.keys()]
      for (const vaultId of vaultIdsAtUnmount) {
        disconnectVault(vaultId)
      }
    }
  }, [])

  return null
}
