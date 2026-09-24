import { afterEach, describe, expect, it, vi } from 'vitest'

import { registerNavigationStateCleanup } from '@clients/extension/src/background/registerNavigationStateCleanup'
import { AppView } from '@clients/extension/src/navigation/AppView'
import { handleNotificationClickEvent } from '@clients/extension/src/notifications/handlePushEvents'
import {
  getInitialView,
  removeInitialView,
  setInitialView,
} from '@clients/extension/src/storage/initialView'

import { chromeMock, getInstalledListeners } from './mocks/chrome'

const setupVaultView: AppView = {
  id: 'setupVault',
  state: {
    keyImportInput: { mnemonic: 'test mnemonic', chains: [] },
  },
}

const fireInstalled = async (reason: string) => {
  for (const listener of getInstalledListeners()) {
    listener({ reason })
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('navigation state cleanup', () => {
  const legacyState = {
    persistedView: [{ id: 'vault' }, setupVaultView],
    initialView: setupVaultView,
    vaults: ['kept'],
  }

  it('clears navigation state left on disk by an older version on update', async () => {
    await chromeMock.storage.local.set(legacyState)
    registerNavigationStateCleanup()

    await fireInstalled('update')

    await expect(chromeMock.storage.local.get()).resolves.toEqual({
      vaults: ['kept'],
    })
  })

  it('leaves storage untouched on install', async () => {
    await chromeMock.storage.local.set(legacyState)
    registerNavigationStateCleanup()

    await fireInstalled('install')

    await expect(chromeMock.storage.local.get()).resolves.toEqual(legacyState)
  })
})

describe('initial view handoff', () => {
  it('keeps the handed-off view in session storage only', async () => {
    await setInitialView(setupVaultView)

    await expect(getInitialView()).resolves.toEqual(setupVaultView)
    expect(chromeMock.storage.local.set).not.toHaveBeenCalled()

    await removeInitialView()

    await expect(getInitialView()).resolves.toBeNull()
  })
})

describe('push notification click', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hands the keysign deeplink to the page it opens through session storage', async () => {
    const qrCodeData = 'vultisig://vultisig.com?type=SignTransaction'
    vi.stubGlobal('self', { clients: { matchAll: vi.fn(async () => []) } })

    await handleNotificationClickEvent({
      notification: { close: vi.fn(), data: { qrCodeData } },
    })

    expect(chromeMock.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://mock-extension-id/index.html',
    })
    await expect(getInitialView()).resolves.toEqual({
      id: 'deeplink',
      state: { url: qrCodeData },
    })
    expect(chromeMock.storage.local.set).not.toHaveBeenCalled()
  })
})
