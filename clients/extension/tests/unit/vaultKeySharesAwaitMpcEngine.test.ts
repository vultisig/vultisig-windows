/**
 * Reading a vault's key shares is the one MPC engine user on the popup's home
 * path. With the SDK loaded on demand (vultisig/vultisig-windows#4937), the
 * MPC lib must not be initialised until the SDK has registered the engine;
 * otherwise the lib would look for an engine that is not there yet.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadMpcEngine = vi.hoisted(() => vi.fn())
const initializeMpcLib = vi.hoisted(() => vi.fn(async () => undefined))

vi.mock('@core/ui/mpc/bootstrapMpcEngine', () => ({ loadMpcEngine }))

vi.mock('@vultisig/core-mpc/lib/initialize', () => ({ initializeMpcLib }))

vi.mock('@vultisig/core-mpc/lib/keyshare', () => ({
  toMpcLibKeyshare: ({ signatureAlgorithm }: { signatureAlgorithm: string }) => ({
    publicKey: () =>
      Buffer.from(signatureAlgorithm === 'ecdsa' ? 'aa' : 'bb', 'hex'),
    free: () => undefined,
  }),
}))

vi.mock('@vultisig/core-mpc/mldsa/initializeMldsa', () => ({
  initializeMldsaLib: async () => undefined,
}))

vi.mock('@vultisig/lib-mldsa/vs_wasm', () => ({
  Keyshare: { fromBytes: () => ({ publicKey: () => new Uint8Array(), free: () => undefined }) },
}))

import { assertVaultKeySharesReadable } from '@core/ui/passcodeEncryption/core/vaultKeyShares'

const settle = () => new Promise(resolve => setTimeout(resolve, 0))

describe('assertVaultKeySharesReadable', () => {
  beforeEach(() => {
    loadMpcEngine.mockReset()
    initializeMpcLib.mockClear()
  })

  it('waits for the SDK to register the engine before initialising the MPC lib', async () => {
    let registerEngine!: () => void
    loadMpcEngine.mockReturnValue(
      new Promise<void>(resolve => {
        registerEngine = resolve
      })
    )

    const pending = assertVaultKeySharesReadable({
      keyShares: { ecdsa: 'ks-ecdsa', eddsa: 'ks-eddsa' },
      libType: 'DKLS',
      publicKeys: { ecdsa: 'aa', eddsa: 'bb' },
    })
    await settle()

    expect(loadMpcEngine).toHaveBeenCalled()
    expect(initializeMpcLib).not.toHaveBeenCalled()

    registerEngine()
    await pending

    expect(initializeMpcLib).toHaveBeenCalledWith('ecdsa')
    expect(initializeMpcLib).toHaveBeenCalledWith('eddsa')
  })
})
