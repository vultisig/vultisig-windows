import { NotificationData } from '@core/ui/notifications/NotificationChannel'
import {
  fetchVapidPublicKey,
  registerDeviceForPushNotifications,
  unregisterDeviceForPushNotifications,
} from '@core/ui/notifications/pushNotificationApi'
import { pushNotificationServerUrl } from '@core/ui/notifications/pushNotificationServerUrl'
import { urlBase64ToUint8Array } from '@core/ui/notifications/urlBase64ToUint8Array'

import {
  openKeysignFromPushNotificationType,
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

const pushSubscribeRetryDelaysMs = [500, 1_500, 3_000]

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const getErrorName = (error: unknown): string =>
  error instanceof Error ? error.name : typeof error

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const getNotificationPermission = (): string =>
  typeof Notification === 'undefined' ? 'unavailable' : Notification.permission

type SubscribeDiagnosticsInput = {
  serverUrl: string
  vapidPublicKey: string
  applicationServerKey: ArrayBuffer
}

const getSubscribeDiagnostics = ({
  serverUrl,
  vapidPublicKey,
  applicationServerKey,
}: SubscribeDiagnosticsInput) => ({
  serverUrl,
  extensionId: chrome.runtime.id,
  notificationPermission: getNotificationPermission(),
  online: typeof navigator === 'undefined' ? 'unknown' : navigator.onLine,
  vapidPublicKeyLength: vapidPublicKey.length,
  applicationServerKeyBytes: applicationServerKey.byteLength,
})

const isRetryablePushSubscribeError = (error: unknown): boolean =>
  getErrorName(error) === 'AbortError'

const toTightArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

const createPushSubscribeError = ({
  error,
  attempt,
  diagnostics,
}: {
  error: unknown
  attempt: number
  diagnostics: ReturnType<typeof getSubscribeDiagnostics>
}): Error => {
  const message = [
    `Push subscription failed after ${attempt} attempt(s):`,
    `${getErrorName(error)}: ${getErrorMessage(error)}.`,
    'This happened inside Chrome/FCM before Vultisig server registration.',
    'Check chrome://gcm-internals, notification permission, VPN/proxy, and Chrome profile registration limits.',
  ].join(' ')
  const result = new Error(message)
  Object.assign(result, { cause: error, diagnostics })
  return result
}

const subscribeToPushManager = async ({
  serverUrl,
  vapidPublicKey,
  applicationServerKey,
}: SubscribeDiagnosticsInput): Promise<PushSubscription> => {
  const diagnostics = getSubscribeDiagnostics({
    serverUrl,
    vapidPublicKey,
    applicationServerKey,
  })
  const maxAttempts = pushSubscribeRetryDelaysMs.length + 1

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        const existing = await self.registration.pushManager.getSubscription()
        if (existing) {
          console.log(
            '[Vultisig Push] Push subscription appeared after retry wait; using it'
          )
          return existing
        }
      }

      console.log(
        `[Vultisig Push] Subscribing to push manager (attempt ${attempt}/${maxAttempts})...`
      )
      return await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })
    } catch (error) {
      console.error('[Vultisig Push] pushManager.subscribe failed:', {
        attempt,
        maxAttempts,
        errorName: getErrorName(error),
        errorMessage: getErrorMessage(error),
        diagnostics,
      })

      const retryDelayMs = pushSubscribeRetryDelaysMs[attempt - 1]
      if (
        attempt === maxAttempts ||
        retryDelayMs === undefined ||
        !isRetryablePushSubscribeError(error)
      ) {
        throw createPushSubscribeError({ error, attempt, diagnostics })
      }

      console.warn(
        `[Vultisig Push] Retrying push subscribe in ${retryDelayMs}ms...`
      )
      await wait(retryDelayMs)
    }
  }

  throw new Error('Push subscription failed unexpectedly')
}

const resolvePushSubscription = async (
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
  const applicationServerKey = toTightArrayBuffer(
    urlBase64ToUint8Array(vapidPublicKey)
  )

  console.log('[Vultisig Push] Prepared VAPID application server key:', {
    vapidPublicKeyLength: vapidPublicKey.length,
    applicationServerKeyBytes: applicationServerKey.byteLength,
  })
  const subscription = await subscribeToPushManager({
    serverUrl,
    vapidPublicKey,
    applicationServerKey,
  })
  console.log('[Vultisig Push] Push subscription created successfully')
  return subscription
}

let pendingPushSubscription: Promise<PushSubscription> | undefined

const getOrCreatePushSubscription = async (
  serverUrl: string
): Promise<PushSubscription> => {
  if (pendingPushSubscription) {
    console.log(
      '[Vultisig Push] Waiting for in-flight push subscription request'
    )
    return pendingPushSubscription
  }

  pendingPushSubscription = resolvePushSubscription(serverUrl).finally(() => {
    pendingPushSubscription = undefined
  })

  return pendingPushSubscription
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

  let legacyUnregisterFailed = false

  for (const v of vaults) {
    if (!v.publicKeys?.ecdsa) continue
    try {
      await unregisterDeviceForPushNotifications({
        serverUrl,
        vaultId: v.publicKeys.ecdsa,
        partyName: v.localPartyId,
      })
    } catch {
      legacyUnregisterFailed = true
    }
  }

  if (legacyUnregisterFailed) {
    console.warn(
      '[Vultisig Push] Vault ID migration: legacy unregister failed for one or more vaults; will retry on next startup'
    )
    return
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

/**
 * Clears pre-opt-in server registrations and local state when possible.
 * @returns Whether it is safe to run follow-up re-registration (no partial
 *   unregister that would be undone by re-registering).
 */
const runOptInMigrationIfNeeded = async (): Promise<boolean> => {
  if (await getOptInMigrationCompleted()) return true

  console.log(
    '[Vultisig Push] One-time migration: clearing pre-opt-in auto-registrations'
  )

  const serverUrl = await getServerUrl()

  const registrations = await getPushNotificationRegistrations()
  let unregisterFailed = false

  for (const reg of Object.values(registrations)) {
    try {
      await unregisterDeviceForPushNotifications({
        serverUrl,
        vaultId: reg.vaultId,
        partyName: reg.partyName,
      })
    } catch {
      unregisterFailed = true
    }
  }

  if (unregisterFailed) {
    console.warn(
      '[Vultisig Push] Opt-in migration: unregister failed for one or more vaults; keeping local registrations for retry'
    )
    return false
  }

  await clearAllPushNotificationRegistrations()
  await setOptInMigrationCompleted()
  console.log('[Vultisig Push] Opt-in migration completed')
  return true
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

const extensionIndexPageUrl = (extensionId: string) =>
  `chrome-extension://${extensionId}/index.html`

/**
 * Focus an open extension tab and reload so {@link NavigationProvider} consumes
 * {@code initialView} from storage. Returns false if no matching tab exists.
 */
const focusReloadExtensionTab = async (
  extensionId: string
): Promise<boolean> => {
  const tabs = await chrome.tabs.query({
    url: `chrome-extension://${extensionId}/*`,
  })
  if (tabs.length === 0) {
    return false
  }
  const preferredUrl = extensionIndexPageUrl(extensionId)
  const tab = tabs.find(t => t.url?.startsWith(preferredUrl)) ?? tabs[0]
  if (tab?.id === undefined) {
    return false
  }
  await chrome.tabs.update(tab.id, { active: true })
  if (tab.windowId !== undefined) {
    await chrome.windows.update(tab.windowId, { focused: true })
  }
  await chrome.tabs.reload(tab.id)
  return true
}

/**
 * Opens or focuses the extension after the user taps a Web Push keysign
 * notification. Prefer {@code chrome.tabs.reload} so initial navigation state
 * is re-read; fall back to runtime messaging (side panel) and then
 * {@code clients} / {@code tabs.create}.
 */
const openExtensionFromPushNotificationClick = async (input: {
  qrCodeData: string | undefined
}): Promise<void> => {
  const { qrCodeData } = input
  const extensionId = chrome.runtime.id
  const extensionUrl = extensionIndexPageUrl(extensionId)

  if (qrCodeData) {
    await chrome.storage.local.set({
      initialView: {
        id: 'deeplink',
        state: { url: qrCodeData },
      },
    })
  }

  if (await focusReloadExtensionTab(extensionId)) {
    return
  }

  if (qrCodeData) {
    try {
      const response: unknown = await chrome.runtime.sendMessage({
        type: openKeysignFromPushNotificationType,
        url: qrCodeData,
      })
      if (
        typeof response === 'object' &&
        response !== null &&
        'ok' in response &&
        Reflect.get(response, 'ok') === true
      ) {
        return
      }
    } catch {
      // No extension page had a listener (e.g. every surface closed).
    }
  }

  const controlled = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: false,
  })
  const extensionClient = controlled.find(
    client =>
      client.url.startsWith(extensionUrl) ||
      client.url.startsWith(`chrome-extension://${extensionId}/`)
  )
  if (extensionClient) {
    try {
      await extensionClient.focus()
      const navigated = await extensionClient.navigate(extensionUrl)
      if (navigated !== null) {
        return
      }
    } catch (error) {
      console.warn('[Vultisig Push] client.focus/navigate failed:', error)
    }
  }

  await chrome.tabs.create({ url: extensionUrl })
}

/** Set in {@link initPushExtensionRuntime}; used by {@link handlePushSubscriptionChangeEvent}. */
let pushStartupWork: Promise<void> = Promise.resolve()

/** Chrome `chrome.notifications` body length limit — full payload lives in session storage. */
const chromeNotificationMessageMaxLen = 240

/** Invoked from {@link ./pushServiceWorkerBindings} via dynamic import. */
export const handlePushEvent = async (event: any): Promise<void> => {
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
    console.error('[Vultisig Push] Failed to parse push payload, raw:', raw)
  }

  const title = data?.title ?? 'Vultisig'
  const body = data?.body ?? ''
  const subtitle = data?.subtitle ?? ''

  console.log('[Vultisig Push] Showing notification:', title, subtitle)

  // macOS + Chrome often does not fire service worker `notificationclick` for
  // `registration.showNotification` (especially expanded banners). Use
  // `chrome.notifications` + `onClicked` so taps open the extension reliably.
  if (typeof chrome !== 'undefined' && chrome.notifications) {
    const notificationId = `vultisig-push-${crypto.randomUUID()}`
    const payloadKey = `vultisigPushQr:${notificationId}`
    await chrome.storage.session.set({ [payloadKey]: body })

    const fullMessage = subtitle
      ? `${subtitle}\n${body}`
      : body || 'Keysign request'
    const message =
      fullMessage.length > chromeNotificationMessageMaxLen
        ? `${fullMessage.slice(0, chromeNotificationMessageMaxLen)}…`
        : fullMessage

    try {
      await chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icon128.png'),
        title,
        message,
        requireInteraction: true,
      })
    } catch (error) {
      await chrome.storage.session.remove(payloadKey)
      console.error(
        '[Vultisig Push] chrome.notifications.create failed:',
        error
      )
      await self.registration.showNotification(title, {
        body: subtitle ? `${subtitle}\n${body}` : body || 'Keysign request',
        icon: 'icon128.png',
        tag: `vultisig-keysign-${crypto.randomUUID()}`,
        requireInteraction: true,
        data: { qrCodeData: body },
      })
    }
    return
  }

  const notificationTag = `vultisig-keysign-${crypto.randomUUID()}`

  await self.registration.showNotification(title, {
    body: subtitle ? `${subtitle}\n${body}` : body || 'Keysign request',
    icon: 'icon128.png',
    tag: notificationTag,
    requireInteraction: true,
    data: { qrCodeData: body },
  })
}

/** Invoked from {@link ./pushServiceWorkerBindings} via dynamic import. */
export const handleNotificationClickEvent = async (
  event: any
): Promise<void> => {
  event.notification.close()

  try {
    const qrCodeData: string | undefined = event.notification.data?.qrCodeData
    await openExtensionFromPushNotificationClick({ qrCodeData })
  } catch (error) {
    console.error('[Vultisig Push] notificationclick failed:', error)
  }
}

/** Invoked from {@link ./pushServiceWorkerBindings} via dynamic import. */
export const handlePushSubscriptionChangeEvent = async (
  _event: any
): Promise<void> => {
  console.warn(
    '[Vultisig Push] Push subscription changed, re-registering vaults...'
  )
  await pushStartupWork
  if (await getOptInMigrationCompleted()) {
    await reRegisterOptedInVaults()
  }
}

const pushChromeNotificationIdPrefix = 'vultisig-push-'

const pushChromeNotificationPayloadKey = (notificationId: string) =>
  `vultisigPushQr:${notificationId}`

const handlePushChromeNotificationClicked = (notificationId: string) => {
  if (!notificationId.startsWith(pushChromeNotificationIdPrefix)) {
    return
  }

  const key = pushChromeNotificationPayloadKey(notificationId)
  void chrome.storage.session.get(key).then(async result => {
    const raw = result[key]
    await chrome.storage.session.remove(key)
    const qrCodeData = typeof raw === 'string' ? raw : undefined
    try {
      await openExtensionFromPushNotificationClick({ qrCodeData })
    } catch (error) {
      console.error('[Vultisig Push] chrome.notifications click failed:', error)
    }
  })
}

const handlePushChromeNotificationClosed = (notificationId: string) => {
  if (!notificationId.startsWith(pushChromeNotificationIdPrefix)) {
    return
  }
  void chrome.storage.session.remove(
    pushChromeNotificationPayloadKey(notificationId)
  )
}

/**
 * Migrations, re-registration, and {@code chrome.runtime.onMessage} for push.
 * Push / notification listeners are registered in {@link ./pushServiceWorkerBindings}
 * and must load before this runs.
 */
export const initPushExtensionRuntime = () => {
  console.log('[Vultisig Push] Service worker push handler initialized')

  if (typeof chrome !== 'undefined' && chrome.notifications) {
    chrome.notifications.onClicked.addListener(
      handlePushChromeNotificationClicked
    )
    chrome.notifications.onClosed.addListener(
      handlePushChromeNotificationClosed
    )
  }

  pushStartupWork = (async () => {
    try {
      await runPushVaultIdMigrationIfNeeded()
      const optInMigrationOk = await runOptInMigrationIfNeeded()
      if (optInMigrationOk) {
        await reRegisterOptedInVaults()
      }
    } catch (error) {
      console.error(
        '[Vultisig Push] Startup push re-registration failed:',
        error
      )
    }
  })()

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === pushRegisterVaultsType) {
      const msg = message as PushRegisterVaultsMessage
      void pushStartupWork
        .then(() => registerVaults(msg.vaults))
        .then(() => sendResponse({ success: true }))
        .catch(error => {
          console.error('[Vultisig Push] Register vaults failed:', error)
          sendResponse({ success: false, error: String(error) })
        })
      return true
    }

    if (message.type === pushForceRegisterVaultType) {
      const msg = message as PushForceRegisterVaultMessage
      void pushStartupWork
        .then(() => forceRegisterVault(msg.vault))
        .then(() => sendResponse({ success: true }))
        .catch(error => {
          console.error('[Vultisig Push] Force register failed:', error)
          sendResponse({ success: false, error: String(error) })
        })
      return true
    }

    if (message.type === pushUnregisterVaultType) {
      const msg = message as PushUnregisterVaultMessage
      void pushStartupWork
        .then(async () => {
          const serverUrl = await getServerUrl()

          // Token-less unregister (like iOS): removes ALL registrations for this
          // vault+party regardless of which push subscription was used originally.
          await unregisterDeviceForPushNotifications({
            serverUrl,
            vaultId: msg.vault.vaultId,
            partyName: msg.vault.localPartyId,
          })

          await removePushNotificationRegistration(msg.vault.vaultId)
        })
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
