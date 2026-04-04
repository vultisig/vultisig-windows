import { pushNotificationServerUrl } from '@core/ui/notifications/pushNotificationServerUrl'

/** WebSocket payload from the notification server (Redis stream → client). */
export type KeysignWsNotification = {
  type: 'notification'
  id: string
  vault_name: string
  qr_code_data: string
}

export const parseKeysignWsNotification = (
  data: unknown
): KeysignWsNotification | null => {
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

/** Input for {@link buildKeysignNotificationWebSocketUrl}. */
export type BuildKeysignNotificationWebSocketUrlInput = {
  /** Notification server base URL (https or http). */
  baseUrl?: string
  vaultId: string
  partyName: string
  token: string
}

/**
 * Builds the notification WebSocket URL for a registered vault (same auth tuple as
 * {@code POST /register}: vault_id, party_name, token).
 */
export const buildKeysignNotificationWebSocketUrl = ({
  baseUrl,
  vaultId,
  partyName,
  token,
}: BuildKeysignNotificationWebSocketUrlInput): string => {
  const origin = (baseUrl ?? pushNotificationServerUrl).replace(
    /^https?:\/\//,
    m => (m.startsWith('https') ? 'wss://' : 'ws://')
  )
  const params = new URLSearchParams({
    vault_id: vaultId,
    party_name: partyName,
    token,
  })
  return `${origin}/ws?${params.toString()}`
}

export const clearWebSocketHandlers = (ws: WebSocket): void => {
  ws.onopen = null
  ws.onmessage = null
  ws.onclose = null
  ws.onerror = null
}

export const keysignNotificationWsInitialReconnectDelayMs = 1000
export const keysignNotificationWsMaxReconnectDelayMs = 30_000
