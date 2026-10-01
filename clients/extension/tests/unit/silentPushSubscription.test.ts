import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { chromeMock } from './mocks/chrome'

const serverUrl = 'https://push.test'
const vapidPublicKey =
  'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
const currentChrome = 'Mozilla/5.0 Chrome/140.0.0.0'
const chromeBefore121 = 'Mozilla/5.0 Chrome/120.0.0.0'

type FakeSubscription = {
  endpoint: string
  options: { userVisibleOnly: boolean }
  unsubscribe: () => Promise<boolean>
  toJSON: () => { endpoint: string }
}

const browser = {
  current: null as FakeSubscription | null,
  acceptsSilentSubscriptions: true,
  pushServiceAvailable: true,
  subscriptionCount: 0,
}

const makeSubscription = (
  endpoint: string,
  userVisibleOnly: boolean
): FakeSubscription => {
  const subscription: FakeSubscription = {
    endpoint,
    options: { userVisibleOnly },
    unsubscribe: vi.fn(async () => {
      if (browser.current === subscription) browser.current = null
      return true
    }),
    toJSON: () => ({ endpoint }),
  }
  return subscription
}

const pushManager = {
  getSubscription: vi.fn(async () => browser.current),
  subscribe: vi.fn(
    async ({ userVisibleOnly }: { userVisibleOnly: boolean }) => {
      if (!browser.pushServiceAvailable) {
        throw new DOMException(
          'Registration failed - push service error',
          'AbortError'
        )
      }
      if (!userVisibleOnly && !browser.acceptsSilentSubscriptions) {
        throw new DOMException(
          'Registration failed - permission denied',
          'NotAllowedError'
        )
      }
      browser.subscriptionCount += 1
      browser.current = makeSubscription(
        `https://fcm.test/${browser.subscriptionCount}`,
        userVisibleOnly
      )
      return browser.current
    }
  ),
}

const registeredEndpoints: string[] = []

const fakePushServer = async (url: string, init?: RequestInit) => {
  if (url === `${serverUrl}/vapid-public-key`) {
    return new Response(JSON.stringify({ public_key: vapidPublicKey }))
  }
  if (url === `${serverUrl}/register`) {
    const { token } = JSON.parse(String(init?.body))
    registeredEndpoints.push(JSON.parse(token).endpoint)
    return new Response(null, { status: 200 })
  }
  throw new Error(`Unexpected request to ${url}`)
}

// Re-registers every opted-in vault, the same work worker startup does.
const reRegisterOptedInVaults = async () => {
  const { handlePushSubscriptionChangeEvent } =
    await import('@clients/extension/src/notifications/handlePushEvents')
  await handlePushSubscriptionChangeEvent({})
}

const subscribeCalls = () =>
  pushManager.subscribe.mock.calls.map(([options]) => options.userVisibleOnly)

describe('push subscription', () => {
  beforeEach(async () => {
    vi.resetModules()
    browser.current = null
    browser.acceptsSilentSubscriptions = true
    browser.pushServiceAvailable = true
    browser.subscriptionCount = 0
    registeredEndpoints.length = 0
    vi.stubGlobal('self', { registration: { pushManager } })
    vi.stubGlobal('navigator', { userAgent: currentChrome })
    vi.stubGlobal('fetch', vi.fn(fakePushServer))
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    await chromeMock.storage.local.set({
      pushNotificationServerUrl: serverUrl,
      pushOptInMigrationCompleted: true,
      pushNotificationRegistrations: {
        vault1: { vaultId: 'vault1', partyName: 'party1', registeredAt: 0 },
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('replaces a user-visible subscription with a silent one', async () => {
    const legacy = makeSubscription('https://fcm.test/legacy', true)
    browser.current = legacy

    await reRegisterOptedInVaults()

    expect(legacy.unsubscribe).toHaveBeenCalledTimes(1)
    expect(subscribeCalls()).toEqual([false])
    expect(registeredEndpoints).toEqual(['https://fcm.test/1'])
  })

  it('keeps a subscription that is already silent', async () => {
    const silent = makeSubscription('https://fcm.test/silent', false)
    browser.current = silent

    await reRegisterOptedInVaults()

    expect(silent.unsubscribe).not.toHaveBeenCalled()
    expect(pushManager.subscribe).not.toHaveBeenCalled()
    expect(registeredEndpoints).toEqual(['https://fcm.test/silent'])
  })

  it('subscribes silently when there is no subscription yet', async () => {
    await reRegisterOptedInVaults()

    expect(subscribeCalls()).toEqual([false])
    expect(registeredEndpoints).toEqual(['https://fcm.test/1'])
  })

  it('keeps a user-visible subscription on a browser that refuses silent ones', async () => {
    vi.stubGlobal('navigator', { userAgent: chromeBefore121 })
    browser.acceptsSilentSubscriptions = false
    browser.current = makeSubscription('https://fcm.test/legacy', true)

    await reRegisterOptedInVaults()

    expect(subscribeCalls()).toEqual([false, true])
    expect(browser.current?.options.userVisibleOnly).toBe(true)
    expect(registeredEndpoints).toEqual(['https://fcm.test/1'])

    vi.resetModules()
    await reRegisterOptedInVaults()

    expect(subscribeCalls()).toEqual([false, true])
    expect(registeredEndpoints).toEqual([
      'https://fcm.test/1',
      'https://fcm.test/1',
    ])
  })

  it('tries a silent subscription again once that browser updates', async () => {
    vi.stubGlobal('navigator', { userAgent: chromeBefore121 })
    browser.acceptsSilentSubscriptions = false
    await reRegisterOptedInVaults()
    const userVisible = browser.current

    vi.stubGlobal('navigator', { userAgent: currentChrome })
    browser.acceptsSilentSubscriptions = true
    vi.resetModules()
    await reRegisterOptedInVaults()

    expect(userVisible?.unsubscribe).toHaveBeenCalledTimes(1)
    expect(subscribeCalls()).toEqual([false, true, false])
    expect(browser.current?.options.userVisibleOnly).toBe(false)
    expect(registeredEndpoints).toEqual([
      'https://fcm.test/1',
      'https://fcm.test/2',
    ])
  })

  it('leaves the subscription alone when the push server is unreachable', async () => {
    const legacy = makeSubscription('https://fcm.test/legacy', true)
    browser.current = legacy
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      })
    )
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await reRegisterOptedInVaults()

    expect(legacy.unsubscribe).not.toHaveBeenCalled()
    expect(browser.current).toBe(legacy)
  })

  // The old subscription has to go before the new one can be made, so a push
  // service failure in between leaves none until the next startup subscribes.
  it('subscribes again on the next startup when the replacement fails', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    browser.current = makeSubscription('https://fcm.test/legacy', true)
    browser.pushServiceAvailable = false

    const failedRun = reRegisterOptedInVaults()
    await vi.runAllTimersAsync()
    await failedRun

    expect(browser.current).toBeNull()
    expect(registeredEndpoints).toEqual([])

    browser.pushServiceAvailable = true
    vi.resetModules()
    await reRegisterOptedInVaults()

    expect(browser.current?.options.userVisibleOnly).toBe(false)
    expect(registeredEndpoints).toEqual(['https://fcm.test/1'])
  })
})
