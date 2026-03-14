import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('scanBlocks lifecycle', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('persists the terminal scan state when already synced to the safe tip', async () => {
    const save = vi.fn(async () => {})
    const scanData = {
      zAddress: 'zs1test',
      publicKeyEcdsa: 'pub',
      scanHeight: 117,
      scanTarget: null,
      birthHeight: 100,
      birthdayScanDone: true,
      pubKeyPackage: 'pkg',
      saplingExtras: 'extras',
      notes: [],
      nullifierVersion: 1,
    }

    vi.doMock('./zcashScanStorage', () => ({
      currentNullifierVersion: 1,
      getZcashScanStorage: () => ({
        load: vi.fn(async () => scanData),
        save,
      }),
    }))

    vi.doMock('./lightwalletd/client', () => ({
      getLatestBlock: vi.fn(async () => ({ height: 120 })),
      getBlockRange: vi.fn(),
      getTransaction: vi.fn(),
      getTreeState: vi.fn(),
    }))

    vi.doMock('frozt-wasm', () => ({
      frozt_sapling_build_dfvk: vi.fn(),
      frozt_sapling_compute_nullifier: vi.fn(),
      frozt_sapling_decrypt_note_full: vi.fn(),
      frozt_sapling_derive_keys: vi.fn(),
      frozt_sapling_tree_size: vi.fn(),
      frozt_sapling_try_decrypt_compact: vi.fn(),
      WasmSaplingTree: class {},
      WasmSaplingWitness: class {},
    }))

    const { scanBlocks } = await import('./scanner')

    await scanBlocks({
      zAddress: 'zs1test',
      publicKeyEcdsa: 'pub',
      pubKeyPackage: new Uint8Array([1]),
      saplingExtras: new Uint8Array([2]),
    })

    expect(save).toHaveBeenCalled()
    const mockCalls = save.mock.calls as unknown as Array<[typeof scanData]>
    const finalSave = mockCalls[mockCalls.length - 1]?.[0]
    expect(finalSave).toBeDefined()
    if (!finalSave) {
      return
    }
    expect(finalSave.scanHeight).toBe(117)
    expect(finalSave.scanTarget).toBe(117)
    expect(finalSave.birthdayScanDone).toBe(true)
  })

  it('does not restart a completed forward scan when the birthday is learned later', async () => {
    let current = {
      zAddress: 'zs1test',
      publicKeyEcdsa: 'pub',
      scanHeight: 117,
      scanTarget: 117,
      birthHeight: null,
      birthdayScanDone: false,
      pubKeyPackage: 'pkg',
      saplingExtras: 'extras',
      notes: [],
      nullifierVersion: 1,
    }
    const save = vi.fn(async data => {
      current = data
    })
    const getBlockRange = vi.fn()
    const getTreeState = vi.fn()

    vi.doMock('./zcashScanStorage', () => ({
      currentNullifierVersion: 1,
      getZcashScanStorage: () => ({
        load: vi.fn(async () => current),
        save,
      }),
    }))

    vi.doMock('./lightwalletd/client', () => ({
      getLatestBlock: vi.fn(async () => ({ height: 120 })),
      getBlockRange,
      getTransaction: vi.fn(),
      getTreeState,
    }))

    vi.doMock('frozt-wasm', () => ({
      frozt_sapling_build_dfvk: vi.fn(),
      frozt_sapling_compute_nullifier: vi.fn(),
      frozt_sapling_decrypt_note_full: vi.fn(),
      frozt_sapling_derive_keys: vi.fn(),
      frozt_sapling_tree_size: vi.fn(),
      frozt_sapling_try_decrypt_compact: vi.fn(),
      WasmSaplingTree: class {},
      WasmSaplingWitness: class {},
    }))

    const { ensureZcashScanDataSynced } = await import('./scanner')

    await ensureZcashScanDataSynced({
      zAddress: 'zs1test',
      publicKeyEcdsa: 'pub',
      pubKeyPackage: new Uint8Array([1]),
      saplingExtras: new Uint8Array([2]),
      birthHeight: 100,
    })

    expect(current.scanHeight).toBe(117)
    expect(current.scanTarget).toBe(117)
    expect(current.birthHeight).toBe(100)
    expect(current.birthdayScanDone).toBe(true)
    expect(getBlockRange).not.toHaveBeenCalled()
    expect(getTreeState).not.toHaveBeenCalled()
  })

  it('resumes an in-progress birthday scan instead of restarting from birth height', async () => {
    const save = vi.fn(async () => {})
    const getBlockRange = vi.fn(async () => [])
    const getTreeState = vi.fn(async () => ({ saplingTree: '00' }))
    const scanData = {
      zAddress: 'zs1test',
      publicKeyEcdsa: 'pub',
      scanHeight: 110,
      scanTarget: 117,
      birthHeight: 100,
      birthdayScanDone: false,
      pubKeyPackage: 'pkg',
      saplingExtras: 'extras',
      notes: [],
      nullifierVersion: 1,
    }

    vi.doMock('./zcashScanStorage', () => ({
      currentNullifierVersion: 1,
      getZcashScanStorage: () => ({
        load: vi.fn(async () => scanData),
        save,
      }),
    }))

    vi.doMock('./lightwalletd/client', () => ({
      getLatestBlock: vi.fn(async () => ({ height: 120 })),
      getBlockRange,
      getTransaction: vi.fn(),
      getTreeState,
    }))

    vi.doMock('frozt-wasm', () => ({
      frozt_sapling_build_dfvk: vi.fn(() => new Uint8Array([1])),
      frozt_sapling_compute_nullifier: vi.fn(),
      frozt_sapling_decrypt_note_full: vi.fn(),
      frozt_sapling_derive_keys: vi.fn(() => ({ ivk: new Uint8Array([1]) })),
      frozt_sapling_tree_size: vi.fn(() => 0),
      frozt_sapling_try_decrypt_compact: vi.fn(() => null),
      WasmSaplingTree: class {
        static fromHexState() {
          return new this()
        }
        appendBundle() {}
      },
      WasmSaplingWitness: class {
        static fromBytes() {
          return new this()
        }
        serialize() {
          return new Uint8Array()
        }
        appendBundle() {}
      },
    }))

    const { scanBlocks } = await import('./scanner')

    await scanBlocks({
      zAddress: 'zs1test',
      publicKeyEcdsa: 'pub',
      pubKeyPackage: new Uint8Array([1]),
      saplingExtras: new Uint8Array([2]),
    })

    expect(getBlockRange).toHaveBeenCalledWith(111, 117)
  })
})
