import { pushNotificationServerUrl } from '@core/ui/notifications/pushNotificationServerUrl'

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
  const response = await fetch(`${pushNotificationServerUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vault_id: vaultId,
      party_name: partyName,
      token,
      device_type: 'desktop',
    }),
  })

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
  const response = await fetch(`${pushNotificationServerUrl}/unregister`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vault_id: vaultId,
      party_name: partyName,
      token,
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to unregister desktop device: ${response.status} ${response.statusText}`
    )
  }
}
