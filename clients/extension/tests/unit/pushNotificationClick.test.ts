import { getInitialView } from '@clients/extension/src/storage/initialView'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { chromeMock } from './mocks/chrome'

const notificationId = 'vultisig-push-1'
const qrCodeData =
  'https://vultisig.com?type=SignTransaction&vault=abc&jsonData=xyz'

const notifications = {
  onClicked: { addListener: vi.fn() },
  onClosed: { addListener: vi.fn() },
  clear: vi.fn(async () => true),
}

const reloadTab = vi.fn(async () => {})

const expandedTab = {
  id: 5,
  windowId: 2,
  active: false,
  url: 'chrome-extension://mock-extension-id/index.html',
}

// The bindings file only registers listeners and exports nothing, so it is
// loaded by path rather than through a typed `import()`.
const loadServiceWorkerBindings = () =>
  vi.importActual(
    '@clients/extension/src/notifications/pushServiceWorkerBindings'
  )

describe('push notification click', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('chrome', {
      ...chromeMock,
      notifications,
      tabs: { ...chromeMock.tabs, reload: reloadTab },
    })
    vi.stubGlobal('self', {
      addEventListener: vi.fn(),
      clients: { matchAll: vi.fn(async () => []) },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // A click on a notification wakes a dormant service worker, and Chrome only
  // delivers it to listeners present once the script's initial evaluation ends.
  it('listens for clicks as soon as the worker script is evaluated', async () => {
    await loadServiceWorkerBindings()

    expect(notifications.onClicked.addListener).toHaveBeenCalledTimes(1)
    expect(notifications.onClosed.addListener).toHaveBeenCalledTimes(1)
  })

  it('opens the keysign request in the expanded tab when it is not the active tab', async () => {
    await chromeMock.storage.session.set({
      [`vultisigPushQr:${notificationId}`]: qrCodeData,
    })
    chromeMock.tabs.query.mockResolvedValue([expandedTab])

    await loadServiceWorkerBindings()
    const [[onClicked]] = notifications.onClicked.addListener.mock.calls
    onClicked(notificationId)

    await vi.waitFor(() => expect(reloadTab).toHaveBeenCalledWith(5))
    await expect(getInitialView()).resolves.toEqual({
      id: 'deeplink',
      state: { url: qrCodeData },
    })
    expect(chromeMock.tabs.update).toHaveBeenCalledWith(5, { active: true })
    expect(chromeMock.windows.update).toHaveBeenCalledWith(2, {
      focused: true,
    })
    expect(chromeMock.tabs.create).not.toHaveBeenCalled()
  })

  // The payload is consumed by the first click, so a notification left behind
  // would reopen the tab without the request.
  it('dismisses the notification once it is clicked', async () => {
    await chromeMock.storage.session.set({
      [`vultisigPushQr:${notificationId}`]: qrCodeData,
    })
    chromeMock.tabs.query.mockResolvedValue([expandedTab])

    await loadServiceWorkerBindings()
    const [[onClicked]] = notifications.onClicked.addListener.mock.calls
    onClicked(notificationId)

    await vi.waitFor(() => expect(reloadTab).toHaveBeenCalled())
    expect(notifications.clear).toHaveBeenCalledWith(notificationId)
    await expect(
      chromeMock.storage.session.get(`vultisigPushQr:${notificationId}`)
    ).resolves.toEqual({ [`vultisigPushQr:${notificationId}`]: undefined })
  })
})
