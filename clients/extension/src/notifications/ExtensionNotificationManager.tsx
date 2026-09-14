import { loadMpcEngine } from '@core/ui/mpc/bootstrapMpcEngine'
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
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { removeInitialView } from '../storage/initialView'
import { getOrCreateFirefoxNotificationToken } from './firefoxNotificationToken'
import { openKeysignFromPushNotificationType } from './pushNotificationMessages'
import {
  getPushNotificationRegistrations,
  getPushServerUrl,
  isVaultRegisteredForPush,
  pushNotificationRegistrationsStorageKey,
} from './pushNotificationStorage'

const maxConsecutiveWsFailures = 5

type OpenKeysignFromPushMessage = {
  type: typeof openKeysignFromPushNotificationType
  url: string
}

const isOpenKeysignFromPushMessage = (
  value: unknown
): value is OpenKeysignFromPushMessage => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const type = Reflect.get(value, 'type')
  const url = Reflect.get(value, 'url')
  return type === openKeysignFromPushNotificationType && typeof url === 'string'
}

type HandleNotificationMessageInput = {
  msg: NonNullable<ReturnType<typeof parseKeysignWsNotification>>
  ws: WebSocket
  vaultId: string
  localPartyName: string
}

type ConnectVaultInput = {
  vaultId: string
  partyName: string
  /**
   * When set, aborts after awaits if a newer {@code syncRegistrations} run
   * started (avoids reopening sockets removed by a later sync).
   */
  syncGeneration?: number
}

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

  useEffect(() => {
    const onOpenKeysignFromPush = (
      message: unknown,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: { ok: boolean }) => void
    ) => {
      if (isOpenKeysignFromPushMessage(message)) {
        void (async () => {
          try {
            navigateRef.current({
              id: 'deeplink',
              state: { url: message.url },
            })
            void window.focus()
            await removeInitialView()
            sendResponse({ ok: true })
          } catch {
            sendResponse({ ok: false })
          }
        })()
        return true
      }
      return false
    }
    chrome.runtime.onMessage.addListener(onOpenKeysignFromPush)
    return () => {
      chrome.runtime.onMessage.removeListener(onOpenKeysignFromPush)
    }
  }, [])

  const showBannerRef = useRef(showBanner)
  showBannerRef.current = showBanner

  const tRef = useRef(t)
  tRef.current = t

  const historyRef = useRef(history)
  historyRef.current = history

  const vaultsRef = useRef(vaults)
  vaultsRef.current = vaults

  // Built the first time a notification needs it, and rebuilt when the vault
  // list changes, so the SDK load it depends on is not started on mount ahead
  // of the idle prefetch. A build that failed is dropped so the next one retries.
  const vaultBannerMetaRef = useRef<{
    vaults: ReturnType<typeof useVaults>
    meta: Promise<Map<string, { isFastVault: boolean }>>
  } | null>(null)

  const getVaultBannerMeta = () => {
    const currentVaults = vaultsRef.current
    const cached = vaultBannerMetaRef.current
    if (cached && cached.vaults === currentVaults) {
      return cached.meta
    }

    const meta = (async () => {
      const { computeNotificationVaultId } = await loadMpcEngine()
      const next = new Map<string, { isFastVault: boolean }>()
      for (const vault of currentVaults) {
        if (!vault.hexChainCode) {
          continue
        }
        const vaultId = await computeNotificationVaultId(
          vault.publicKeys.ecdsa,
          vault.hexChainCode
        )
        next.set(vaultId, { isFastVault: hasServer(vault.signers) })
      }
      return next
    })()
    meta.catch(() => {
      if (vaultBannerMetaRef.current?.meta === meta) {
        vaultBannerMetaRef.current = null
      }
    })
    vaultBannerMetaRef.current = { vaults: currentVaults, meta }

    return meta
  }
  const getVaultBannerMetaRef = useRef(getVaultBannerMeta)
  getVaultBannerMetaRef.current = getVaultBannerMeta

  const connectionsRef = useRef<
    Map<string, ManagedExtensionNotificationSocket>
  >(new Map())
  const reconnectDelayMsRef = useRef<Record<string, number>>({})
  const failureCountRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const connectionsMap = connectionsRef.current
    let syncSessionGeneration = 0
    const activeNotificationTeardowns = new Set<() => void>()

    const getTokenJson = async (): Promise<string | null> => {
      // Firefox MV3 has no extension service worker: `navigator.serviceWorker.ready`
      // never resolves, so use the locally generated device token (same one used
      // to register with the server).
      if (__IS_FIREFOX_EXTENSION_BUILD__) {
        return getOrCreateFirefoxNotificationToken()
      }
      try {
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.getSubscription()
        return sub ? JSON.stringify(sub.toJSON()) : null
      } catch {
        return null
      }
    }

    const handleNotificationMessage = async ({
      msg,
      ws,
      vaultId,
      localPartyName,
    }: HandleNotificationMessageInput) => {
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
        vaultBannerMeta: withFallback(
          await attempt(getVaultBannerMetaRef.current),
          new Map()
        ),
        navigateToKeysign,
        showBanner: showBannerRef.current,
        bringAppToFront: () => {
          window.focus()
        },
        showOsNotification: ({ title, body, onClick }) => {
          if (typeof chrome === 'undefined' || !chrome.notifications) {
            return
          }
          const notificationId = `vultisig-keysign-${crypto.randomUUID()}`
          function teardown() {
            activeNotificationTeardowns.delete(teardown)
            chrome.notifications.onClicked.removeListener(handleClick)
            chrome.notifications.onClosed.removeListener(handleClosed)
          }
          activeNotificationTeardowns.add(teardown)
          function handleClosed(closedId: string) {
            if (closedId !== notificationId) {
              return
            }
            teardown()
          }
          function handleClick(clickedId: string) {
            if (clickedId !== notificationId) {
              return
            }
            teardown()
            window.focus()
            onClick?.()
          }
          chrome.notifications.onClicked.addListener(handleClick)
          chrome.notifications.onClosed.addListener(handleClosed)
          void chrome.notifications
            .create(notificationId, {
              type: 'basic',
              iconUrl: chrome.runtime.getURL('icon128.png'),
              title,
              message: body,
              requireInteraction: true,
            })
            .catch(() => {
              teardown()
            })
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
      delete failureCountRef.current[vaultId]
      if (managed.ws) {
        const ws = managed.ws
        clearWebSocketHandlers(ws)
        managed.ws = null
        managed.activeWsUrl = null
        ws.close()
      }
    }

    const connectVault = async ({
      vaultId,
      partyName,
      syncGeneration,
    }: ConnectVaultInput) => {
      const isStaleSync = () =>
        syncGeneration !== undefined && syncGeneration !== syncSessionGeneration

      const token = await getTokenJson()
      if (isStaleSync()) {
        return
      }
      if (!token) {
        return
      }

      const baseUrl = (await getPushServerUrl()) ?? pushNotificationServerUrl
      if (isStaleSync()) {
        return
      }

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
        failureCountRef.current[vaultId] = 0
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

        void handleNotificationMessage({
          msg: notification,
          ws,
          vaultId,
          localPartyName: managed.partyName,
        }).catch(error => {
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

          if (connectionsRef.current.get(vaultId) !== entry) {
            return
          }

          const failures = (failureCountRef.current[vaultId] ?? 0) + 1
          failureCountRef.current[vaultId] = failures

          if (failures >= maxConsecutiveWsFailures) {
            console.warn(
              `[ExtensionNotificationManager] Stopping reconnection for vault ${vaultId.slice(0, 12)}... after ${failures} consecutive failures`
            )
            disconnectVault(vaultId)
            return
          }

          const prevDelay =
            reconnectDelayMsRef.current[vaultId] ??
            keysignNotificationWsInitialReconnectDelayMs
          const jitterMs = Math.random() * prevDelay * 0.5
          entry.reconnectTimer = setTimeout(() => {
            entry.reconnectTimer = undefined
            if (connectionsRef.current.get(vaultId) !== entry) {
              return
            }
            void connectVault({ vaultId, partyName: entry.partyName })
          }, prevDelay + jitterMs)
          reconnectDelayMsRef.current[vaultId] = Math.min(
            prevDelay * 2,
            keysignNotificationWsMaxReconnectDelayMs
          )
        })()
      }
    }

    const syncRegistrations = () => {
      const myGeneration = ++syncSessionGeneration
      void (async () => {
        const registrations = await getPushNotificationRegistrations()
        if (myGeneration !== syncSessionGeneration) {
          return
        }
        const activeVaultIds = new Set(Object.keys(registrations))

        for (const vaultId of connectionsRef.current.keys()) {
          if (!activeVaultIds.has(vaultId)) {
            disconnectVault(vaultId)
          }
        }

        const token = await getTokenJson()
        if (myGeneration !== syncSessionGeneration) {
          return
        }
        if (!token) {
          for (const vaultId of connectionsRef.current.keys()) {
            disconnectVault(vaultId)
          }
          return
        }

        for (const [vaultId, reg] of Object.entries(registrations)) {
          if (myGeneration !== syncSessionGeneration) {
            return
          }
          await connectVault({
            vaultId,
            partyName: reg.partyName,
            syncGeneration: myGeneration,
          })
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
      for (const teardown of [...activeNotificationTeardowns]) {
        teardown()
      }
      syncSessionGeneration += 1
      chrome.storage.onChanged.removeListener(onChromeStorageChanged)
      const vaultIdsAtUnmount = [...connectionsMap.keys()]
      for (const vaultId of vaultIdsAtUnmount) {
        disconnectVault(vaultId)
      }
    }
  }, [])

  return null
}
