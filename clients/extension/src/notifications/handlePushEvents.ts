import { NotificationData } from '@core/ui/notifications/NotificationChannel'
import {
  fetchVapidPublicKey,
  registerDeviceForPushNotifications,
} from '@core/ui/notifications/pushNotificationApi'
import { devPushNotificationServerUrl } from '@core/ui/notifications/pushNotificationServerUrl'
import { urlBase64ToUint8Array } from '@core/ui/notifications/urlBase64ToUint8Array'

import { setInitialView } from '../storage/initialView'
import {
  PushForceRegisterVaultMessage,
  pushForceRegisterVaultType,
  PushRegisterVaultsMessage,
  pushRegisterVaultsType,
  VaultRegistrationInfo,
} from './pushNotificationMessages'
import {
  getPushNotificationRegistrations,
  getPushServerUrl,
  setPushNotificationRegistration,
} from './pushNotificationStorage'

declare const self: {
  addEventListener: (type: string, listener: (event: any) => void) => void
  registration: {
    showNotification: (
      title: string,
      options: NotificationOptions & { data?: Record<string, string> }
    ) => Promise<void>
    pushManager: {
      getSubscription: () => Promise<PushSubscription | null>
      subscribe: (options: {
        userVisibleOnly: boolean
        applicationServerKey: ArrayBuffer
      }) => Promise<PushSubscription>
    }
  }
  clients: {
    matchAll: (options: {
      type: string
      includeUncontrolled: boolean
    }) => Promise<
      {
        url: string
        focus: () => Promise<void>
        navigate: (url: string) => void
      }[]
    >
    openWindow: (url: string) => Promise<void>
  }
}

const getServerUrl = async (): Promise<string> =>
  (await getPushServerUrl()) ?? devPushNotificationServerUrl

const getOrCreatePushSubscription = async (
  serverUrl: string
): Promise<PushSubscription> => {
  console.log('[Vultisig Push] Checking existing push subscription...')
  const existing = await self.registration.pushManager.getSubscription()
  if (existing) {
    console.log('[Vultisig Push] Using existing push subscription')
    return existing
  }

  console.log(
    `[Vultisig Push] No existing subscription. Fetching VAPID key from ${serverUrl}...`
  )
  const vapidPublicKey = await fetchVapidPublicKey({ serverUrl })
  console.log(
    `[Vultisig Push] Got VAPID key: ${vapidPublicKey.slice(0, 20)}...`
  )
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)
    .buffer as ArrayBuffer

  console.log('[Vultisig Push] Subscribing to push manager...')
  const subscription = await self.registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  })
  console.log('[Vultisig Push] Push subscription created successfully')
  return subscription
}

const forceRegisterVault = async (
  vault: VaultRegistrationInfo
): Promise<void> => {
  const serverUrl = await getServerUrl()
  console.log(
    `[Vultisig Push] Force-registering vault ${vault.vaultId.slice(0, 12)}... with server ${serverUrl}`
  )

  const subscription = await getOrCreatePushSubscription(serverUrl)

  console.log(
    `[Vultisig Push] Calling POST ${serverUrl}/register for vault ${vault.vaultId.slice(0, 12)}...`
  )
  await registerDeviceForPushNotifications({
    serverUrl,
    vaultId: vault.vaultId,
    partyName: vault.localPartyId,
    subscription,
  })

  await setPushNotificationRegistration(vault.vaultId, vault.localPartyId)
  console.log(
    `[Vultisig Push] Successfully registered vault ${vault.vaultId.slice(0, 12)}...`
  )
}

const registerVaults = async (
  vaults: VaultRegistrationInfo[]
): Promise<void> => {
  if (vaults.length === 0) return

  const serverUrl = await getServerUrl()
  const registrations = await getPushNotificationRegistrations()
  const unregistered = vaults.filter(v => !(v.vaultId in registrations))

  if (unregistered.length === 0) {
    console.log('[Vultisig Push] All vaults already registered locally')
    return
  }

  console.log(
    `[Vultisig Push] Registering ${unregistered.length} vault(s) for push`
  )

  const subscription = await getOrCreatePushSubscription(serverUrl)

  for (const vault of unregistered) {
    console.log(
      `[Vultisig Push] Calling POST ${serverUrl}/register for vault ${vault.vaultId.slice(0, 12)}...`
    )
    await registerDeviceForPushNotifications({
      serverUrl,
      vaultId: vault.vaultId,
      partyName: vault.localPartyId,
      subscription,
    })
    await setPushNotificationRegistration(vault.vaultId, vault.localPartyId)
    console.log(
      `[Vultisig Push] Registered vault ${vault.vaultId.slice(0, 12)}...`
    )
  }
}

type StoredVault = {
  publicKeys: { ecdsa: string }
  localPartyId: string
}

const registerVaultsFromStorage = async (): Promise<void> => {
  const result = await chrome.storage.local.get('vaults')
  const vaults = (result.vaults ?? []) as StoredVault[]
  if (vaults.length === 0) {
    console.log('[Vultisig Push] No vaults in storage, skipping auto-register')
    return
  }

  console.log(
    `[Vultisig Push] Found ${vaults.length} vault(s) in storage, checking registration`
  )

  const vaultInfos: VaultRegistrationInfo[] = vaults.map(v => ({
    vaultId: v.publicKeys.ecdsa,
    localPartyId: v.localPartyId,
  }))

  await registerVaults(vaultInfos)
}

export const handlePushEvents = () => {
  // Auto-register all vaults on service worker startup
  registerVaultsFromStorage().catch(error =>
    console.error('[Vultisig Push] Auto-register on startup failed:', error)
  )

  // Re-check when vaults change in storage (e.g. vault created/imported)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return
    if (!('vaults' in changes)) return

    registerVaultsFromStorage().catch(error =>
      console.error('[Vultisig Push] Auto-register on change failed:', error)
    )
  })

  // Handle messages from the UI
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === pushRegisterVaultsType) {
      const msg = message as PushRegisterVaultsMessage
      registerVaults(msg.vaults)
        .then(() => sendResponse({ success: true }))
        .catch(error => {
          console.error('[Vultisig Push] Register vaults failed:', error)
          sendResponse({ success: false, error: String(error) })
        })
      return true
    }

    if (message.type === pushForceRegisterVaultType) {
      const msg = message as PushForceRegisterVaultMessage
      forceRegisterVault(msg.vault)
        .then(() => sendResponse({ success: true }))
        .catch(error => {
          console.error('[Vultisig Push] Force register failed:', error)
          sendResponse({ success: false, error: String(error) })
        })
      return true
    }

    return false
  })

  // Handle incoming push notifications
  self.addEventListener('push', (event: any) => {
    const data: NotificationData | undefined = event.data?.json()
    if (!data) return

    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: `${data.subtitle}\n${data.body}`,
        icon: 'icon128.png',
        tag: 'vultisig-keysign',
        requireInteraction: true,
        data: { qrCodeData: data.body },
      })
    )
  })

  // Handle notification click — open keysign flow
  self.addEventListener('notificationclick', (event: any) => {
    event.notification.close()

    const qrCodeData: string | undefined = event.notification.data?.qrCodeData
    if (!qrCodeData) return

    event.waitUntil(
      (async () => {
        await setInitialView({
          id: 'deeplink',
          state: { url: qrCodeData },
        })

        const extensionUrl = `chrome-extension://${chrome.runtime.id}/index.html`

        const allClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        })

        const existingClient = allClients.find(client =>
          client.url.startsWith(extensionUrl)
        )

        if (existingClient) {
          await existingClient.focus()
          existingClient.navigate(extensionUrl)
          return
        }

        await self.clients.openWindow(extensionUrl)
      })()
    )
  })

  // Handle subscription expiry
  self.addEventListener('pushsubscriptionchange', (event: any) => {
    event.waitUntil(
      (async () => {
        console.warn('[Vultisig Push] Push subscription expired')
      })()
    )
  })
}
