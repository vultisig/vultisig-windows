import { VaultAllKeyShares } from '@vultisig/core-mpc/vault/Vault'
import { encryptWithAesGcm } from '@vultisig/lib-utils/encryption/aesGcm/encryptWithAesGcm'
import {
  encryptedEncoding,
  plainTextEncoding,
} from '@vultisig/lib-utils/encryption/config'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  isPasscodeRequired,
  mayNeedPasscodeSampleRewrite,
  needsPasscodeSampleRewrite,
  verifyPasscode,
} from './passcodeLock'
import { encryptSample } from './sample'
import { encryptVaultAllKeyShares } from './vaultKeyShares'

const passcode = '123456'
const otherPasscode = '654321'

const plainShares: VaultAllKeyShares = {
  keyShares: { ecdsa: 'ecdsa-share', eddsa: 'eddsa-share' },
}

/** Headerless `SHA-256(passcode)` blob, the format predating the PBKDF2 one. */
const legacyBlob = (value: string, key: string) =>
  encryptWithAesGcm({
    key,
    value: Buffer.from(value, plainTextEncoding),
  }).toString(encryptedEncoding)

const legacyShares: VaultAllKeyShares = {
  keyShares: {
    ecdsa: legacyBlob('ecdsa-share', passcode),
    eddsa: legacyBlob('eddsa-share', passcode),
  },
}

let sealedShares: VaultAllKeyShares
let sealedSharesUnderOther: VaultAllKeyShares
let sample: string
let sampleUnderOther: string
let legacySample: string

beforeAll(async () => {
  sealedShares = await encryptVaultAllKeyShares({
    ...plainShares,
    key: passcode,
  })
  sealedSharesUnderOther = await encryptVaultAllKeyShares({
    ...plainShares,
    key: otherPasscode,
  })
  sample = await encryptSample({ key: passcode, value: 'sample' })
  sampleUnderOther = await encryptSample({
    key: otherPasscode,
    value: 'sample',
  })
  legacySample = legacyBlob('sample', passcode)
})

describe('isPasscodeRequired', () => {
  it('is false with no passcode in play', () => {
    expect(
      isPasscodeRequired({ vaults: [plainShares], encryptedSample: null })
    ).toBe(false)
  })

  it('is true on the stored proof alone', () => {
    expect(
      isPasscodeRequired({ vaults: [plainShares], encryptedSample: sample })
    ).toBe(true)
  })

  it('is true on sealed shares alone, which is what a half-landed write leaves', () => {
    expect(
      isPasscodeRequired({ vaults: [sealedShares], encryptedSample: null })
    ).toBe(true)
  })

  it('cannot see legacy headerless shares, so falls back to the proof', () => {
    expect(
      isPasscodeRequired({ vaults: [legacyShares], encryptedSample: null })
    ).toBe(false)
  })
})

describe('verifyPasscode', () => {
  it('accepts the passcode that opens the sealed shares', async () => {
    await expect(
      verifyPasscode({
        vaults: [sealedShares],
        encryptedSample: sample,
        passcode,
      })
    ).resolves.toBe(true)
  })

  it('rejects a passcode the shares do not answer to, even when the sample says yes', async () => {
    await expect(
      verifyPasscode({
        vaults: [sealedShares],
        encryptedSample: sampleUnderOther,
        passcode: otherPasscode,
      })
    ).resolves.toBe(false)
  })

  it('accepts the shares passcode when the sample disagrees', async () => {
    await expect(
      verifyPasscode({
        vaults: [sealedShares],
        encryptedSample: sampleUnderOther,
        passcode,
      })
    ).resolves.toBe(true)
  })

  it('falls back to the sample when nothing is recognizably sealed', async () => {
    const lockState = { vaults: [plainShares], encryptedSample: sample }

    await expect(verifyPasscode({ ...lockState, passcode })).resolves.toBe(true)
    await expect(
      verifyPasscode({ ...lockState, passcode: otherPasscode })
    ).resolves.toBe(false)
  })

  it('rejects everything when there is nothing to check against', async () => {
    await expect(
      verifyPasscode({
        vaults: [plainShares],
        encryptedSample: null,
        passcode,
      })
    ).resolves.toBe(false)
  })
})

describe('mayNeedPasscodeSampleRewrite', () => {
  it('is false with no passcode in play', () => {
    expect(
      mayNeedPasscodeSampleRewrite({
        vaults: [plainShares],
        encryptedSample: null,
      })
    ).toBe(false)
  })

  it('is true for a missing proof beside sealed shares', () => {
    expect(
      mayNeedPasscodeSampleRewrite({
        vaults: [sealedShares],
        encryptedSample: null,
      })
    ).toBe(true)
  })

  it('is true for a legacy sample even with nothing sealed', () => {
    expect(
      mayNeedPasscodeSampleRewrite({
        vaults: [legacyShares],
        encryptedSample: legacySample,
      })
    ).toBe(true)
  })

  it('defers to the async check whenever sealed shares could contradict the sample', () => {
    expect(
      mayNeedPasscodeSampleRewrite({
        vaults: [sealedShares],
        encryptedSample: sample,
      })
    ).toBe(true)
  })
})

describe('needsPasscodeSampleRewrite', () => {
  it('is false for a sample that already answers to the passcode', async () => {
    await expect(
      needsPasscodeSampleRewrite({
        vaults: [sealedShares],
        encryptedSample: sample,
        passcode,
      })
    ).resolves.toBe(false)
  })

  it('is true for a stale sample the sealed shares contradict', async () => {
    await expect(
      needsPasscodeSampleRewrite({
        vaults: [sealedShares],
        encryptedSample: sampleUnderOther,
        passcode,
      })
    ).resolves.toBe(true)
  })

  it('is true for a missing sample beside sealed shares', async () => {
    await expect(
      needsPasscodeSampleRewrite({
        vaults: [sealedShares],
        encryptedSample: null,
        passcode,
      })
    ).resolves.toBe(true)
  })

  it('is true for a legacy sample', async () => {
    await expect(
      needsPasscodeSampleRewrite({
        vaults: [legacyShares],
        encryptedSample: legacySample,
        passcode,
      })
    ).resolves.toBe(true)
  })

  it('is false with no passcode in play, so the lock can never be turned on', async () => {
    await expect(
      needsPasscodeSampleRewrite({
        vaults: [plainShares],
        encryptedSample: null,
        passcode,
      })
    ).resolves.toBe(false)
  })

  it('refuses to replace a sample on the word of a passcode that opens nothing', async () => {
    await expect(
      needsPasscodeSampleRewrite({
        vaults: [sealedSharesUnderOther],
        encryptedSample: sample,
        passcode: 'wrong-guess',
      })
    ).resolves.toBe(false)
  })
})
