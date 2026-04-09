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
  if (!response.ok) {
    throw new Error(
      `Failed to fetch VAPID public key: ${response.status} ${response.statusText}`
    )
  }
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
  let response: Response
  try {
    response = await fetch(`${serverUrl}/unregister`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vault_id: vaultId,
        party_name: partyName,
        token: token ?? '',
      }),
    })
  } catch (fetchError) {
    console.warn(
      `[Vultisig Push] Unregister fetch failed for vault ${vaultId.slice(0, 12)}… — treating as success:`,
      fetchError
    )
    return
  }

  if (!response.ok) {
    console.warn(
      `[Vultisig Push] Unregister returned ${response.status} for vault ${vaultId.slice(0, 12)}… — treating as success`
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
const notifyVaultDevicesTimeoutMs = 15_000

export const notifyVaultDevices = async ({
  serverUrl,
  vaultId,
  vaultName,
  localPartyId,
  qrCodeData,
}: NotifyVaultDevicesInput): Promise<void> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    notifyVaultDevicesTimeoutMs
  )

  try {
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
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(
        `Failed to notify vault devices: ${response.status} ${response.statusText}`
      )
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        `Failed to notify vault devices: timed out after ${notifyVaultDevicesTimeoutMs}ms`
      )
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
