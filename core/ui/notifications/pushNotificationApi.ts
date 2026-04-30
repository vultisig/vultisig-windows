type FetchVapidKeyInput = {
  serverUrl: string
}

const pushNotificationApiTimeoutMs = 15_000

type FetchWithTimeoutInput = {
  url: string
  options?: RequestInit
  errorContext: string
}

const fetchWithTimeout = async ({
  url,
  options,
  errorContext,
}: FetchWithTimeoutInput): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    pushNotificationApiTimeoutMs
  )

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        `${errorContext}: timed out after ${pushNotificationApiTimeoutMs}ms`
      )
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

const getResponseErrorBody = async (response: Response): Promise<string> => {
  try {
    const body = await response.text()
    return body ? `: ${body.slice(0, 300)}` : ''
  } catch {
    return ''
  }
}

type FetchVapidKeyResult = {
  public_key: string
}

export const fetchVapidPublicKey = async ({
  serverUrl,
}: FetchVapidKeyInput): Promise<string> => {
  const response = await fetchWithTimeout({
    url: `${serverUrl}/vapid-public-key`,
    errorContext: 'Failed to fetch VAPID public key',
  })
  if (!response.ok) {
    throw new Error(
      `Failed to fetch VAPID public key: ${response.status} ${response.statusText}${await getResponseErrorBody(response)}`
    )
  }
  const data: FetchVapidKeyResult = await response.json()
  const publicKey =
    typeof data.public_key === 'string' ? data.public_key.trim() : ''
  if (!publicKey) {
    throw new Error('Failed to fetch VAPID public key: response was empty')
  }
  return publicKey
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
  const token = JSON.stringify(subscription.toJSON())
  const response = await fetchWithTimeout({
    url: `${serverUrl}/register`,
    errorContext: 'Failed to register device',
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
      `Failed to register device: ${response.status} ${response.statusText}${await getResponseErrorBody(response)} (subscription token length: ${token.length})`
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
    response = await fetchWithTimeout({
      url: `${serverUrl}/unregister`,
      errorContext: 'Failed to unregister device',
      options: {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vault_id: vaultId,
          party_name: partyName,
          token: token ?? '',
        }),
      },
    })
  } catch (fetchError) {
    const err = new Error(
      `Unregister fetch failed for vault ${vaultId.slice(0, 12)}…`
    )
    Object.assign(err, { cause: fetchError })
    throw err
  }

  if (!response.ok) {
    if (response.status === 404) {
      return
    }
    throw new Error(
      `Failed to unregister device: ${response.status} ${response.statusText}${await getResponseErrorBody(response)}`
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
