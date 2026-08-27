import { VaultAllKeyShares } from '@vultisig/core-mpc/vault/Vault'
import { attempt } from '@vultisig/lib-utils/attempt'

import { passcodeEncryptionConfig } from './config'
import { getStoredPasscodeLength } from './passcodePolicy'
import { decryptSample } from './sample'
import {
  decryptVaultAllKeyShares,
  isLegacyEncryptedPasscodeBlob,
  vaultKeySharesArePasscodeEncrypted,
} from './vaultKeyShares'

type PasscodeLockState = {
  vaults: VaultAllKeyShares[]
  encryptedSample: string | null
}

/**
 * Whether the app has to ask for a passcode before it can serve key shares.
 *
 * The stored proof normally answers this on its own, but it and the sealed
 * shares are separate durable writes: an interrupted set-passcode, or a wiped
 * WebView profile on desktop, can leave sealed shares with no proof beside
 * them. Without counting the shares the app would show no lock screen and hand
 * ciphertext downstream as if it were the share.
 */
export const isPasscodeRequired = ({
  vaults,
  encryptedSample,
}: PasscodeLockState): boolean =>
  encryptedSample !== null || vaults.some(vaultKeySharesArePasscodeEncrypted)

/**
 * Synchronous gate for the post-unlock reconcile: whether the stored state
 * could need its passcode sample rewritten.
 *
 * A sample can also be *stale* — current-format but sealed under a passcode the
 * shares no longer answer to — and that only shows up under decryption. So this
 * answers `true` whenever sealed shares exist to contradict the sample and
 * leaves the real decision to {@link needsPasscodeSampleRewrite}. Answers
 * `false` when no passcode is in play, so it can never turn the lock on for
 * someone who has not set one.
 */
export const mayNeedPasscodeSampleRewrite = ({
  vaults,
  encryptedSample,
}: PasscodeLockState): boolean =>
  (encryptedSample !== null &&
    isLegacyEncryptedPasscodeBlob(encryptedSample)) ||
  vaults.some(vaultKeySharesArePasscodeEncrypted)

type VerifyPasscodeInput = PasscodeLockState & {
  passcode: string
}

type PasscodeEntryInput = VerifyPasscodeInput & {
  allowProoflessLegacy?: boolean
  storedPasscodeLength?: number
}

type PasscodeEntryVerification = 'incomplete' | 'invalid' | 'valid'

/**
 * Number of input slots to show on the lock screen.
 *
 * A stored proof carries enough metadata to preserve the passcode length used
 * when it was written. When that proof is gone, encrypted shares prove that a
 * passcode still exists but cannot reveal its length, so recovery shows the
 * current six-digit policy. A legacy five-digit passcode can still be submitted
 * explicitly, but is never probed automatically while the sixth digit is being
 * entered.
 */
export const getPasscodeEntryLength = ({
  encryptedSample,
  storedPasscodeLength,
}: Pick<PasscodeEntryInput, 'encryptedSample' | 'storedPasscodeLength'>) =>
  encryptedSample === null
    ? passcodeEncryptionConfig.passcodeLength
    : getStoredPasscodeLength(storedPasscodeLength)

export const isPasscodeEntryCandidate = ({
  allowProoflessLegacy = false,
  encryptedSample,
  passcode,
  storedPasscodeLength,
}: Pick<
  PasscodeEntryInput,
  | 'allowProoflessLegacy'
  | 'encryptedSample'
  | 'passcode'
  | 'storedPasscodeLength'
>): boolean => {
  const isExplicitLegacyRecovery =
    allowProoflessLegacy &&
    encryptedSample === null &&
    passcode.length === passcodeEncryptionConfig.legacyPasscodeLength

  return (
    isExplicitLegacyRecovery ||
    passcode.length ===
      getPasscodeEntryLength({ encryptedSample, storedPasscodeLength })
  )
}

/**
 * Whether a passcode opens what is actually stored.
 *
 * The sealed key shares are the authority, not the passcode sample: they are
 * the thing the passcode has to unseal, and the two are written separately, so
 * an interrupted write can leave a sample that validates a passcode the shares
 * no longer answer to. The sample is consulted only when no vault is
 * recognizably sealed — with encryption off, or on legacy headerless shares,
 * it is the sole thing left to check against.
 */
export const verifyPasscode = async ({
  vaults,
  encryptedSample,
  passcode,
}: VerifyPasscodeInput): Promise<boolean> => {
  const sealedVault = vaults.find(vaultKeySharesArePasscodeEncrypted)

  if (sealedVault) {
    const { keyShares, chainKeyShares, keyShareMldsa } = sealedVault

    const result = await attempt(() =>
      decryptVaultAllKeyShares({
        key: passcode,
        keyShares,
        chainKeyShares,
        keyShareMldsa,
      })
    )

    return 'data' in result
  }

  if (encryptedSample === null) {
    return false
  }

  const result = await attempt(() =>
    decryptSample({ key: passcode, value: encryptedSample })
  )

  return 'data' in result
}

/**
 * Verify one complete lock-screen candidate.
 *
 * Only the proof-declared length, the current six-digit recovery length, or an
 * explicitly submitted proofless legacy value reaches the expensive verifier.
 * This keeps every failed verification inside the normal attempt throttle.
 */
export const verifyPasscodeEntry = async ({
  storedPasscodeLength,
  ...input
}: PasscodeEntryInput): Promise<PasscodeEntryVerification> => {
  if (
    !isPasscodeEntryCandidate({
      allowProoflessLegacy: input.allowProoflessLegacy,
      encryptedSample: input.encryptedSample,
      passcode: input.passcode,
      storedPasscodeLength,
    })
  ) {
    return 'incomplete'
  }

  return (await verifyPasscode(input)) ? 'valid' : 'invalid'
}

type NeedsPasscodeSampleRewriteInput = PasscodeLockState & {
  passcode: string
}

/**
 * Whether the stored passcode sample has to be rewritten for the passcode the
 * app is unlocked with.
 *
 * Three states qualify: no sample beside sealed shares, a sample still on the
 * legacy KDF, and — the one only decryption can see — a current-format sample
 * sealed under a passcode the shares no longer answer to, which is what a
 * change-passcode interrupted between its two writes leaves behind.
 *
 * A healthy unlock costs one key derivation, spent opening the sample. The
 * repair path spends a second one re-proving the passcode against the sealed
 * shares: a sample is never replaced on the word of a passcode that cannot open
 * the vault, and with nothing sealed to prove it against, nothing is written.
 */
export const needsPasscodeSampleRewrite = async ({
  vaults,
  encryptedSample,
  passcode,
}: NeedsPasscodeSampleRewriteInput): Promise<boolean> => {
  if (encryptedSample === null) {
    return vaults.some(vaultKeySharesArePasscodeEncrypted)
  }

  if (isLegacyEncryptedPasscodeBlob(encryptedSample)) {
    return true
  }

  const opened = await attempt(() =>
    decryptSample({ key: passcode, value: encryptedSample })
  )

  if ('data' in opened) {
    return false
  }

  return verifyPasscode({ vaults, encryptedSample, passcode })
}
