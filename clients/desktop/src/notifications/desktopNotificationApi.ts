import { pushNotificationServerUrl } from '@core/ui/notifications/pushNotificationServerUrl'

const desktopNotificationFetchTimeoutMs = 10_000

const fetchWithTimeout = async (
  input: string,
  init: RequestInit,
  timeoutMs = desktopNotificationFetchTimeoutMs
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

type RegisterDesktopDeviceInput = {
  vaultId: string
  partyName: string
  token: string
}

/** Register a desktop device with the notification backend. */
export const registerDesktopDevice = async ({
  vaultId,
  partyName,
  token,
}: RegisterDesktopDeviceInput): Promise<void> => {
  const response = await fetchWithTimeout(
    `${pushNotificationServerUrl}/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vault_id: vaultId,
        party_name: partyName,
        token,
        device_type: 'desktop',
      }),
    }
  )

  if (!response.ok) {
    throw new Error(
      `Failed to register desktop device: ${response.status} ${response.statusText}`
    )
  }
}

type UnregisterDesktopDeviceInput = {
  vaultId: string
  partyName: string
  token: string
}

/** Unregister a desktop device from the notification backend. */
export const unregisterDesktopDevice = async ({
  vaultId,
  partyName,
  token,
}: UnregisterDesktopDeviceInput): Promise<void> => {
  const response = await fetchWithTimeout(
    `${pushNotificationServerUrl}/unregister`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vault_id: vaultId,
        party_name: partyName,
        token,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(
      `Failed to unregister desktop device: ${response.status} ${response.statusText}`
    )
  }
}
