import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chromeMock, getInstalledListeners } from './mocks/chrome'

vi.mock('@core/inpage-provider/background/events/background', () => ({
  runBackgroundEventsAgent: vi.fn(),
}))
vi.mock('@core/inpage-provider/bridge/background', () => ({
  runInpageProviderBridgeBackgroundAgent: vi.fn(),
}))
vi.mock('@clients/extension/src/storage/isSidePanelEnabled', () => ({
  getIsSidePanelEnabled: vi.fn(),
}))
vi.mock(
  '@clients/extension/src/background/registerFastVaultPasswordCacheExpiry',
  () => ({ registerFastVaultPasswordCacheExpiry: vi.fn() })
)

describe('extension background installation', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('preserves existing local and session storage on install', async () => {
    const vaults = [{ name: 'Existing vault', isBackedUp: false }]
    const session = { activeVaultId: 'existing-vault' }

    await chromeMock.storage.local.set({ vaults, preference: 'keep' })
    await chromeMock.storage.session.set(session)

    await import('@clients/extension/src/background/common')

    for (const listener of getInstalledListeners()) {
      listener({ reason: 'install' })
    }

    await expect(chromeMock.storage.local.get()).resolves.toEqual({
      vaults,
      preference: 'keep',
    })
    await expect(chromeMock.storage.session.get()).resolves.toEqual(session)
    expect(chromeMock.storage.local.clear).not.toHaveBeenCalled()
    expect(chromeMock.storage.session.clear).not.toHaveBeenCalled()
  })
})
