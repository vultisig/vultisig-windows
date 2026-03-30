type FetchVapidKeyInput = {
  serverUrl: string
}

type FetchVapidKeyResult = {
  public_key: string
}

export const fetchVapidPublicKey = async ({
  serverUrl,
}: FetchVapidKeyInput): Promise<string> => {
  const response = await fetch(`${serverUrl}/vapid-public-key`)
  const data: FetchVapidKeyResult = await response.json()
  return data.public_key
}

type RegisterDeviceInput = {
  serverUrl: string
  vaultId: string
  partyName: string
  subscription: PushSubscription
}

export const registerDeviceForPushNotifications = async ({
  serverUrl,
  vaultId,
  partyName,
  subscription,
}: RegisterDeviceInput): Promise<void> => {
  const response = await fetch(`${serverUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vault_id: vaultId,
      party_name: partyName,
      token: JSON.stringify(subscription.toJSON()),
      device_type: 'web',
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to register device: ${response.status} ${response.statusText}`
    )
  }
}

type UnregisterDeviceInput = {
  serverUrl: string
  vaultId: string
  partyName: string
  token?: string
}

export const unregisterDeviceForPushNotifications = async ({
  serverUrl,
  vaultId,
  partyName,
  token,
}: UnregisterDeviceInput): Promise<void> => {
  const response = await fetch(`${serverUrl}/unregister`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vault_id: vaultId,
      party_name: partyName,
      token: token ?? '',
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to unregister device: ${response.status} ${response.statusText}`
    )
  }
}

type NotifyVaultDevicesInput = {
  /** Base URL including `/notification` path segment (no trailing slash). */
  serverUrl: string
  vaultId: string
  vaultName: string
  localPartyId: string
  qrCodeData: string
}

/**
 * Notifies other vault devices to join an in-progress keysign session.
 * POST `{serverUrl}/notify` with iOS-aligned payload and `X-Client-ID: vultisig`.
 */
export const notifyVaultDevices = async ({
  serverUrl,
  vaultId,
  vaultName,
  localPartyId,
  qrCodeData,
}: NotifyVaultDevicesInput): Promise<void> => {
  const response = await fetch(`${serverUrl}/notify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-ID': 'vultisig',
    },
    body: JSON.stringify({
      vault_id: vaultId,
      vault_name: vaultName,
      local_party_id: localPartyId,
      qr_code_data: qrCodeData,
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to notify vault devices: ${response.status} ${response.statusText}`
    )
  }
}
