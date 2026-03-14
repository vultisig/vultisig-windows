import { Chain } from '@core/chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ensureZcashSaplingScanState } from './vaultSetup'
import { setZcashScanStorage, ZcashScanData } from './zcashScanStorage'

vi.mock('@core/mpc/frozt/initialize', () => ({
  initializeFrozt: vi.fn(async () => {}),
}))

vi.mock('frozt-wasm', () => ({
  frozt_keyshare_bundle_birthday: vi.fn(() => 123n),
}))

vi.mock('./getZcashZAddress', () => ({
  getZcashZAddress: vi.fn(async () => 'zs1-test-address'),
}))

const baseVault = {
  name: 'Vault',
  publicKeys: {
    ecdsa: 'ecdsa-pub',
    eddsa: 'eddsa-pub',
  },
  signers: ['device', 'server'],
  hexChainCode: 'chain-code',
  keyShares: {
    ecdsa: 'ecdsa-share',
    eddsa: 'eddsa-share',
  },
  localPartyId: 'device',
  libType: 'DKLS',
  isBackedUp: false,
  order: 0,
  chainPublicKeys: {
    [Chain.ZcashSapling]: Buffer.from('pubkey-package').toString('base64'),
  },
  chainKeyShares: {
    [Chain.ZcashSapling]: Buffer.from('bundle').toString('base64'),
  },
  saplingExtras: Buffer.from('sapling-extras').toString('base64'),
} as const

describe('ensureZcashSaplingScanState', () => {
  let current: ZcashScanData | null

  beforeEach(() => {
    current = null
    setZcashScanStorage({
      load: async () => current,
      save: async data => {
        current = data
      },
    })
  })

  it('creates scan state with the bundle birthday', async () => {
    const result = await ensureZcashSaplingScanState(baseVault as any)

    expect(result.address).toBe('zs1-test-address')
    expect(current?.birthHeight).toBe(123)
    expect(current?.birthdayScanDone).toBe(false)
    expect(current?.scanHeight).toBeNull()
    expect(current?.scanTarget).toBeNull()
  })

  it('backfills missing birthdays without resetting existing scan progress', async () => {
    current = {
      zAddress: 'zs1-old-address',
      publicKeyEcdsa: 'ecdsa-pub',
      scanHeight: 999,
      scanTarget: 1001,
      birthHeight: null,
      birthdayScanDone: true,
      pubKeyPackage: 'old-package',
      saplingExtras: 'old-extras',
      notes: [],
    }

    await ensureZcashSaplingScanState(baseVault as any)

    expect(current?.birthHeight).toBe(123)
    expect(current?.birthdayScanDone).toBe(true)
    expect(current?.scanHeight).toBe(999)
    expect(current?.scanTarget).toBe(1001)
    expect(current?.zAddress).toBe('zs1-test-address')
  })
})
