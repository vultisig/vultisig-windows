import { useAppNavigate } from '@clients/desktop/src/navigation/hooks/useAppNavigate'
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
import { useNavigation } from '@lib/ui/navigation/state'
import { hasServer } from '@vultisig/core-mpc/devices/localPartyId'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { computeNotificationVaultId } from '@vultisig/sdk'
import { WindowShow, WindowUnminimise } from '@wailsapp/runtime'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { ShowNotification } from '../../wailsjs/go/main/App'
import {
  desktopNotificationRegistrationsChangedEvent,
  getDesktopNotificationRegistrations,
  isDesktopVaultRegistered,
} from './desktopNotificationStorage'
import { getOrCreateDesktopNotificationToken } from './desktopNotificationToken'

type HandleNotificationMessageInput = {
  msg: NonNullable<ReturnType<typeof parseKeysignWsNotification>>
  ws: WebSocket
  vaultId: string
  localPartyName: string
}

type ManagedDesktopNotificationSocket = {
  activeWsUrl: string | null
  partyName: string
  reconnectTimer: ReturnType<typeof setTimeout> | undefined
  ws: WebSocket | null
}

/**
 * Keeps WebSocket connections open for opted-in vaults, shows keysign request
 * banners and OS notifications, and brings the Wails window forward.
 */
export const DesktopNotificationManager = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
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

  const connectionsRef = useRef<Map<string, ManagedDesktopNotificationSocket>>(
    new Map()
  )
  const reconnectDelayMsRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const connectionsMap = connectionsRef.current
    const token = getOrCreateDesktopNotificationToken()

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
        vaultBannerMeta: vaultBannerMetaRef.current,
        navigateToKeysign,
        showBanner: showBannerRef.current,
        bringAppToFront: () => {
          WindowUnminimise()
          WindowShow()
        },
        showOsNotification: ({ title, body }) => {
          // Desktop OS toasts are best-effort alerts only:
          // - macOS dev: osascript → Script Editor–style banner (not the app icon).
          // - Windows: WinRT toast titled under “Vultisig”, but no click → keysign.
          // - Linux: notify-send, same limitation.
          // Parity with iOS / extension tap-to-keysign is via bringAppToFront +
          // in-app KeysignNotificationBanner (and deeplink when the user acts there).
          ShowNotification(title, body).catch(error => {
            console.debug(
              '[DesktopNotificationManager] ShowNotification failed',
              error
            )
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
      if (managed.ws) {
        const ws = managed.ws
        clearWebSocketHandlers(ws)
        managed.ws = null
        managed.activeWsUrl = null
        ws.close()
      }
    }

    const connectVault = (vaultId: string, partyName: string) => {
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
        baseUrl: pushNotificationServerUrl,
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

        void handleNotificationMessage({
          msg: notification,
          ws,
          vaultId,
          localPartyName: managed.partyName,
        }).catch(error => {
          console.warn(
            '[DesktopNotificationManager] handle message failed',
            error
          )
        })
      }

      ws.onerror = event => {
        console.debug('[DesktopNotificationManager] WebSocket error', event)
      }

      ws.onclose = () => {
        const entry = connectionsRef.current.get(vaultId)
        if (!entry) {
          return
        }
        entry.ws = null
        entry.activeWsUrl = null

        if (!isDesktopVaultRegistered(vaultId)) {
          return
        }

        const prevDelay =
          reconnectDelayMsRef.current[vaultId] ??
          keysignNotificationWsInitialReconnectDelayMs
        const jitterMs = Math.random() * prevDelay * 0.5
        entry.reconnectTimer = setTimeout(() => {
          entry.reconnectTimer = undefined
          connectVault(vaultId, entry.partyName)
        }, prevDelay + jitterMs)
        reconnectDelayMsRef.current[vaultId] = Math.min(
          prevDelay * 2,
          keysignNotificationWsMaxReconnectDelayMs
        )
      }
    }

    const syncRegistrations = () => {
      const registrations = getDesktopNotificationRegistrations()
      const activeVaultIds = new Set(Object.keys(registrations))

      for (const vaultId of connectionsRef.current.keys()) {
        if (!activeVaultIds.has(vaultId)) {
          disconnectVault(vaultId)
        }
      }

      for (const [vaultId, reg] of Object.entries(registrations)) {
        connectVault(vaultId, reg.partyName)
      }
    }

    syncRegistrations()

    const onRegistrationsChanged = () => {
      syncRegistrations()
    }
    window.addEventListener(
      desktopNotificationRegistrationsChangedEvent,
      onRegistrationsChanged
    )

    return () => {
      window.removeEventListener(
        desktopNotificationRegistrationsChangedEvent,
        onRegistrationsChanged
      )
      const vaultIdsAtUnmount = [...connectionsMap.keys()]
      for (const vaultId of vaultIdsAtUnmount) {
        disconnectVault(vaultId)
      }
    }
  }, [])

  return null
}
