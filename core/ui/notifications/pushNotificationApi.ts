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
