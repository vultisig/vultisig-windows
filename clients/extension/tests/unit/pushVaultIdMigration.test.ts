import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { chromeMock } from './mocks/chrome'

// Chrome rejects every import() in an extension service worker, so the push
// handler that runs there must never need the SDK (#5213).
vi.mock('@vultisig/sdk', () => {
  throw new TypeError('import() is disallowed on ServiceWorkerGlobalScope')
})

const serverUrl = 'https://push.test'
const vapidPublicKey =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'

const vault = {
  publicKeys: { ecdsa: '04testEcdsaPubKeyHex' },
  hexChainCode: '00112233445566778899aabbccddeeff',
  localPartyId: 'party1',
}
// SHA-256 of the ECDSA key followed by the chain code, as iOS and the SDK compute it.
const notificationVaultId =
  '456168d997f217cd775b746980ec0b41ae48660bab1e8334c10209a6ea6564cc'

const server = {
  registered: [] as string[],
  unregistered: [] as string[],
}

const fakePushServer = async (url: string, init?: RequestInit) => {
  if (url === `${serverUrl}/vapid-public-key`) {
    return new Response(JSON.stringify({ public_key: vapidPublicKey }))
  }
  const { vault_id } = JSON.parse(String(init?.body))
  if (url === `${serverUrl}/register`) {
    server.registered.push(vault_id)
    return new Response(null, { status: 200 })
  }
  if (url === `${serverUrl}/unregister`) {
    server.unregistered.push(vault_id)
    return new Response(null, { status: 200 })
  }
  throw new Error(`Unexpected request to ${url}`)
}

const pushManager = {
  getSubscription: vi.fn(async () => null),
  subscribe: vi.fn(async () => ({
    endpoint: 'https://fcm.test/1',
    options: { userVisibleOnly: false },
    unsubscribe: async () => true,
    toJSON: () => ({ endpoint: 'https://fcm.test/1' }),
  })),
}

// Starts the worker's push runtime and waits for its startup work to settle.
const startServiceWorker = async () => {
  const { initPushExtensionRuntime, handlePushSubscriptionChangeEvent } =
    await import('@clients/extension/src/notifications/handlePushEvents')
  initPushExtensionRuntime()
  await handlePushSubscriptionChangeEvent({})
}

describe('push vault ID migration', () => {
  beforeEach(async () => {
    vi.resetModules()
    server.registered.length = 0
    server.unregistered.length = 0
    vi.stubGlobal('self', { registration: { pushManager } })
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 Chrome/140.0.0.0' })
    vi.stubGlobal('fetch', vi.fn(fakePushServer))
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    await chromeMock.storage.local.set({
      vaults: [vault],
      pushNotificationServerUrl: serverUrl,
      pushOptInMigrationCompleted: true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('moves each vault from its legacy ID to the new one without the SDK', async () => {
    const consoleError = vi.spyOn(console, 'error')

    await startServiceWorker()

    expect(consoleError).not.toHaveBeenCalled()
    expect(server.unregistered).toEqual([vault.publicKeys.ecdsa])
    expect(new Set(server.registered)).toEqual(new Set([notificationVaultId]))

    const { pushNotificationRegistrations, pushVaultIdMigrated } =
      await chromeMock.storage.local.get([
        'pushNotificationRegistrations',
        'pushVaultIdMigrated',
      ])
    expect(Object.keys(pushNotificationRegistrations)).toEqual([
      notificationVaultId,
    ])
    expect(pushVaultIdMigrated).toBe(true)
  })

  it('runs only once', async () => {
    await startServiceWorker()
    server.unregistered.length = 0

    vi.resetModules()
    await startServiceWorker()

    expect(server.unregistered).toEqual([])
  })
})
