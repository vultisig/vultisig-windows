import { describe, expect, it, vi } from 'vitest'

import { registerFreshInstallStorageClear } from '@clients/extension/src/background/registerFreshInstallStorageClear'

import { chromeMock, getInstalledListeners } from './mocks/chrome'

describe('registerFreshInstallStorageClear', () => {
  it('clears extension storage on fresh install', async () => {
    registerFreshInstallStorageClear()

    getInstalledListeners()[0]({ reason: 'install' })

    await vi.waitFor(() => {
      expect(chromeMock.storage.local.clear).toHaveBeenCalledTimes(1)
      expect(chromeMock.storage.session.clear).toHaveBeenCalledTimes(1)
    })
  })

  it('keeps extension storage on update', async () => {
    registerFreshInstallStorageClear()

    getInstalledListeners()[0]({ reason: 'update' })
    await Promise.resolve()

    expect(chromeMock.storage.local.clear).not.toHaveBeenCalled()
    expect(chromeMock.storage.session.clear).not.toHaveBeenCalled()
  })
})
