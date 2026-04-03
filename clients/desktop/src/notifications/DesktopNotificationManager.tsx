import { useAppNavigate } from '@clients/desktop/src/navigation/hooks/useAppNavigate'
import { useNotificationBanner } from '@core/ui/notifications/NotificationBannerProvider'
import { pushNotificationServerUrl } from '@core/ui/notifications/pushNotificationServerUrl'
import { WindowShow, WindowUnminimise } from '@wailsapp/runtime'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import {
  desktopNotificationRegistrationsChangedEvent,
  getDesktopNotificationRegistrations,
  isDesktopVaultRegistered,
} from './desktopNotificationStorage'
import { getOrCreateDesktopNotificationToken } from './desktopNotificationToken'

type WSNotification = {
  type: 'notification'
  id: string
  vault_name: string
  qr_code_data: string
}

type ManagedDesktopNotificationSocket = {
  /** Party name used for the active (or last connecting) WebSocket URL. */
  activeWsUrl: string | null
  partyName: string
  reconnectTimer: ReturnType<typeof setTimeout> | undefined
  ws: WebSocket | null
}

const initialReconnectDelayMs = 1000
const maxReconnectDelayMs = 30000

/** Build the notification WebSocket URL for a registered vault. */
const buildDesktopNotificationWebSocketUrl = ({
  vaultId,
  partyName,
  token,
}: {
  vaultId: string
  partyName: string
  token: string
}): string => {
  const wsOrigin = pushNotificationServerUrl.replace(/^https?:\/\//, m =>
    m.startsWith('https') ? 'wss://' : 'ws://'
  )
  const params = new URLSearchParams({
    vault_id: vaultId,
    party_name: partyName,
    token,
  })
  return `${wsOrigin}/ws?${params.toString()}`
}

const parseWSNotification = (data: unknown): WSNotification | null => {
  if (typeof data !== 'object' || data === null) return null
  if (!('type' in data) || data.type !== 'notification') return null
  if (!('id' in data) || typeof data.id !== 'string') return null
  if (!('vault_name' in data) || typeof data.vault_name !== 'string')
    return null
  if (!('qr_code_data' in data) || typeof data.qr_code_data !== 'string')
    return null
  return {
    type: 'notification',
    id: data.id,
    vault_name: data.vault_name,
    qr_code_data: data.qr_code_data,
  }
}

const clearSocketHandlers = (ws: WebSocket) => {
  ws.onopen = null
  ws.onmessage = null
  ws.onclose = null
  ws.onerror = null
}

/**
 * Keeps WebSocket connections open for opted-in vaults, shows keysign request
 * banners and OS notifications, and brings the Wails window forward.
 */
export const DesktopNotificationManager = () => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const { showBanner } = useNotificationBanner()

  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const showBannerRef = useRef(showBanner)
  showBannerRef.current = showBanner

  const tRef = useRef(t)
  tRef.current = t

  const connectionsRef = useRef<Map<string, ManagedDesktopNotificationSocket>>(
    new Map()
  )
  const reconnectDelayMsRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const connectionsMap = connectionsRef.current
    const token = getOrCreateDesktopNotificationToken()

    const handleNotificationMessage = (msg: WSNotification, ws: WebSocket) => {
      const navigateToKeysign = () => {
        navigateRef.current({
          id: 'deeplink',
          state: { url: msg.qr_code_data },
        })
      }

      showBannerRef.current({
        title: tRef.current('keysign_request'),
        subtitle: `${tRef.current('vault')}: ${msg.vault_name}`,
        onAction: navigateToKeysign,
      })

      if (
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        const osNotification = new Notification(
          tRef.current('keysign_request'),
          {
            body: `${tRef.current('vault')}: ${msg.vault_name}`,
          }
        )
        osNotification.onclick = () => {
          window.focus()
          navigateToKeysign()
        }
      }

      WindowUnminimise()
      WindowShow()

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ack', id: msg.id }))
      }
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
        clearSocketHandlers(ws)
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

      const url = buildDesktopNotificationWebSocketUrl({
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
        clearSocketHandlers(existingWs)
        existingWs.close()
        managed.ws = null
        managed.activeWsUrl = null
      }

      const ws = new WebSocket(url)
      managed.ws = ws
      managed.activeWsUrl = url

      ws.onopen = () => {
        reconnectDelayMsRef.current[vaultId] = initialReconnectDelayMs
      }

      ws.onmessage = event => {
        if (typeof event.data !== 'string') return
        let parsed: unknown
        try {
          parsed = JSON.parse(event.data)
        } catch {
          return
        }

        const notification = parseWSNotification(parsed)
        if (!notification) {
          return
        }

        handleNotificationMessage(notification, ws)
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
          reconnectDelayMsRef.current[vaultId] ?? initialReconnectDelayMs
        const jitterMs = Math.random() * prevDelay * 0.5
        entry.reconnectTimer = setTimeout(() => {
          entry.reconnectTimer = undefined
          connectVault(vaultId, entry.partyName)
        }, prevDelay + jitterMs)
        reconnectDelayMsRef.current[vaultId] = Math.min(
          prevDelay * 2,
          maxReconnectDelayMs
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
