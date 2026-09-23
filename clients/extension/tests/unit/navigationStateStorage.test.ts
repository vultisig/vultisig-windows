import { describe, expect, it } from 'vitest'

import { registerNavigationStateCleanup } from '@clients/extension/src/background/registerNavigationStateCleanup'
import { AppView } from '@clients/extension/src/navigation/AppView'
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
