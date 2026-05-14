import { pushNotificationServerUrl } from '@core/ui/notifications/pushNotificationServerUrl'

import { getPushServerUrl } from './pushNotificationStorage'

const firefoxNotificationFetchTimeoutMs = 15_000

type FetchWithTimeoutInput = {
  url: string
  options: RequestInit
}

const fetchWithTimeout = async ({
  url,
  options,
}: FetchWithTimeoutInput): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    firefoxNotificationFetchTimeoutMs
  )
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

const getServerUrl = async (): Promise<string> =>
  (await getPushServerUrl()) ?? pushNotificationServerUrl

type FirefoxDeviceRegistrationInput = {
  vaultId: string
  partyName: string
  token: string
}

/**
 * Firefox MV3 has no extension service worker, so Web Push is unavailable.
 * Register the device directly with the notification server using a locally
 * generated token; the same token authenticates the popup-side WebSocket.
 */
export const registerFirefoxDevice = async ({
  vaultId,
  partyName,
  token,
}: FirefoxDeviceRegistrationInput): Promise<void> => {
  const serverUrl = await getServerUrl()
  const response = await fetchWithTimeout({
    url: `${serverUrl}/register`,
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vault_id: vaultId,
        party_name: partyName,
        token,
        device_type: 'web',
      }),
    },
  })
  if (!response.ok) {
    throw new Error(
      `Failed to register Firefox device: ${response.status} ${response.statusText}`
    )
  }
}

/** Remove this Firefox device's registration from the notification server. */
export const unregisterFirefoxDevice = async ({
  vaultId,
  partyName,
  token,
}: FirefoxDeviceRegistrationInput): Promise<void> => {
  const serverUrl = await getServerUrl()
  const response = await fetchWithTimeout({
    url: `${serverUrl}/unregister`,
    options: {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vault_id: vaultId,
        party_name: partyName,
        token,
      }),
    },
  })
  if (!response.ok && response.status !== 404) {
    throw new Error(
      `Failed to unregister Firefox device: ${response.status} ${response.statusText}`
    )
  }
}
