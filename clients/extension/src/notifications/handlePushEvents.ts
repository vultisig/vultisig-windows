import { NotificationData } from '@core/ui/notifications/NotificationChannel'
import {
  fetchVapidPublicKey,
  registerDeviceForPushNotifications,
  unregisterDeviceForPushNotifications,
} from '@core/ui/notifications/pushNotificationApi'
import { pushNotificationServerUrl } from '@core/ui/notifications/pushNotificationServerUrl'
import { urlBase64ToUint8Array } from '@core/ui/notifications/urlBase64ToUint8Array'

import {
  PushForceRegisterVaultMessage,
  pushForceRegisterVaultType,
  PushRegisterVaultsMessage,
  pushRegisterVaultsType,
  PushUnregisterVaultMessage,
  pushUnregisterVaultType,
  VaultRegistrationInfo,
} from './pushNotificationMessages'
import {
  clearAllPushNotificationRegistrations,
  getOptInMigrationCompleted,
  getPushNotificationRegistrations,
  getPushServerUrl,
  getPushVaultIdMigrationCompleted,
  removePushNotificationRegistration,
  setOptInMigrationCompleted,
  setPushNotificationRegistration,
  setPushVaultIdMigrationCompleted,
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
        navigate: (url: string) => Promise<{ url: string } | null>
      }[]
    >
    openWindow: (url: string) => Promise<void>
  }
}

const getServerUrl = async (): Promise<string> =>
  (await getPushServerUrl()) ?? pushNotificationServerUrl

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

  await setPushNotificationRegistration({
    vaultId: vault.vaultId,
    partyName: vault.localPartyId,
  })
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
    try {
      console.log(
        `[Vultisig Push] Calling POST ${serverUrl}/register for vault ${vault.vaultId.slice(0, 12)}...`
      )
      await registerDeviceForPushNotifications({
        serverUrl,
        vaultId: vault.vaultId,
        partyName: vault.localPartyId,
        subscription,
      })
      await setPushNotificationRegistration({
        vaultId: vault.vaultId,
        partyName: vault.localPartyId,
      })
      console.log(
        `[Vultisig Push] Registered vault ${vault.vaultId.slice(0, 12)}...`
      )
    } catch (error) {
      console.error(
        `[Vultisig Push] Failed to register vault ${vault.vaultId.slice(0, 12)}...:`,
        error
      )
    }
  }
}

type StoredVault = {
  publicKeys: { ecdsa: string }
  hexChainCode?: string
  localPartyId: string
}

const mapStoredVaultsToRegistrationInfos = async (
  vaults: StoredVault[]
): Promise<VaultRegistrationInfo[]> => {
  const { computeNotificationVaultId } = await import('@vultisig/sdk')
  const { shouldBePresent } =
    await import('@vultisig/lib-utils/assert/shouldBePresent')

  const eligible = vaults.filter(v => {
    if (!v.hexChainCode) {
      console.warn(
        '[Vultisig Push] Vault missing hexChainCode; skipping push registration for party',
        v.localPartyId
      )
      return false
    }
    return true
  })

  return Promise.all(
    eligible.map(async v => ({
      vaultId: await computeNotificationVaultId(
        v.publicKeys.ecdsa,
        shouldBePresent(v.hexChainCode)
      ),
      localPartyId: v.localPartyId,
    }))
  )
}

const runPushVaultIdMigrationIfNeeded = async (): Promise<void> => {
  if (await getPushVaultIdMigrationCompleted()) return

  console.log(
    '[Vultisig Push] One-time migration: re-registering push with SHA256(ecdsa+chainCode) vault IDs'
  )

  const serverUrl = await getServerUrl()

  const result = await chrome.storage.local.get('vaults')
  const vaults = (result.vaults ?? []) as StoredVault[]

  for (const v of vaults) {
    if (!v.publicKeys?.ecdsa) continue
    try {
      await unregisterDeviceForPushNotifications({
        serverUrl,
        vaultId: v.publicKeys.ecdsa,
        partyName: v.localPartyId,
      })
    } catch {
      // Network errors are non-fatal — retry next startup.
    }
  }

  await clearAllPushNotificationRegistrations()

  if (vaults.length > 0) {
    const vaultInfos = await mapStoredVaultsToRegistrationInfos(vaults)
    await registerVaults(vaultInfos)

    if (vaultInfos.length > 0) {
      const registrations = await getPushNotificationRegistrations()
      const missing = vaultInfos.filter(v => !(v.vaultId in registrations))
      if (missing.length > 0) {
        console.error(
          '[Vultisig Push] Migration incomplete: push registration failed for',
          missing.length,
          'vault(s); will retry on next startup'
        )
        return
      }
    }
  }

  await setPushVaultIdMigrationCompleted()
}

const runOptInMigrationIfNeeded = async (): Promise<void> => {
  if (await getOptInMigrationCompleted()) return

  console.log(
    '[Vultisig Push] One-time migration: clearing pre-opt-in auto-registrations'
  )

  const serverUrl = await getServerUrl()

  const registrations = await getPushNotificationRegistrations()

  for (const reg of Object.values(registrations)) {
    try {
      await unregisterDeviceForPushNotifications({
        serverUrl,
        vaultId: reg.vaultId,
        partyName: reg.partyName,
      })
    } catch {
      // Network errors are non-fatal for migration — retry next startup.
    }
  }

  await clearAllPushNotificationRegistrations()
  await setOptInMigrationCompleted()
  console.log('[Vultisig Push] Opt-in migration completed')
}

const reRegisterOptedInVaults = async (): Promise<void> => {
  const registrations = await getPushNotificationRegistrations()
  const vaultInfos = Object.values(registrations).map(r => ({
    vaultId: r.vaultId,
    localPartyId: r.partyName,
  }))

  if (vaultInfos.length === 0) {
    console.log('[Vultisig Push] No opted-in vaults, skipping re-registration')
    return
  }

  console.log(
    `[Vultisig Push] Re-registering ${vaultInfos.length} opted-in vault(s) for push`
  )

  for (const vault of vaultInfos) {
    try {
      await forceRegisterVault(vault)
    } catch (error) {
      console.error(
        `[Vultisig Push] Failed to re-register vault ${vault.vaultId.slice(0, 12)}...:`,
        error
      )
    }
  }
}

export const handlePushEvents = () => {
  console.log('[Vultisig Push] Service worker push handler initialized')

  // Register SW events immediately (synchronous). Chrome requires these during
  // initial worker evaluation — do not defer behind migration, messaging, or
  // other setup.
  self.addEventListener('push', (event: any) => {
    event.waitUntil(
      (async () => {
        let data: NotificationData | undefined
        try {
          data = event.data?.json()
        } catch {
          let raw = '<no data>'
          try {
            raw = event.data?.text() ?? '<null>'
          } catch {
            raw = '<unreadable>'
          }
          console.error(
            '[Vultisig Push] Failed to parse push payload, raw:',
            raw
          )
        }

        const title = data?.title ?? 'Vultisig'
        const body = data?.body ?? ''
        const subtitle = data?.subtitle ?? ''

        console.log('[Vultisig Push] Showing notification:', title, subtitle)

        await self.registration.showNotification(title, {
          body: subtitle ? `${subtitle}\n${body}` : body || 'Keysign request',
          icon: 'icon128.png',
          tag: 'vultisig-keysign',
          requireInteraction: true,
          data: { qrCodeData: body },
        })
      })()
    )
  })

  // Handle notification click — open keysign flow
  self.addEventListener('notificationclick', (event: any) => {
    event.notification.close()

    event.waitUntil(
      (async () => {
        const qrCodeData: string | undefined =
          event.notification.data?.qrCodeData
        if (qrCodeData) {
          await chrome.storage.local.set({
            initialView: {
              id: 'deeplink',
              state: { url: qrCodeData },
            },
          })
        }

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
          await existingClient.navigate(extensionUrl)
          return
        }

        await self.clients.openWindow(extensionUrl)
      })()
    )
  })

  self.addEventListener('pushsubscriptionchange', (event: any) => {
    event.waitUntil(
      (async () => {
        console.warn(
          '[Vultisig Push] Push subscription changed, re-registering vaults...'
        )
        await reRegisterOptedInVaults()
      })()
    )
  })

  // Run migration (if needed) before normal registration so local registration
  // keys match the new vault_id scheme before any concurrent UI-driven register.
  ;(async () => {
    await runPushVaultIdMigrationIfNeeded()
    await runOptInMigrationIfNeeded()
    await reRegisterOptedInVaults()
  })().catch(error =>
    console.error('[Vultisig Push] Startup push re-registration failed:', error)
  )

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

    if (message.type === pushUnregisterVaultType) {
      const msg = message as PushUnregisterVaultMessage
      ;(async () => {
        const serverUrl = await getServerUrl()

        // Token-less unregister (like iOS): removes ALL registrations for this
        // vault+party regardless of which push subscription was used originally.
        await unregisterDeviceForPushNotifications({
          serverUrl,
          vaultId: msg.vault.vaultId,
          partyName: msg.vault.localPartyId,
        })

        await removePushNotificationRegistration(msg.vault.vaultId)
      })()
        .then(() => sendResponse({ success: true }))
        .catch(error => {
          console.error('[Vultisig Push] Unregister failed:', error)
          sendResponse({ success: false, error: String(error) })
        })
      return true
    }

    return false
  })
}
