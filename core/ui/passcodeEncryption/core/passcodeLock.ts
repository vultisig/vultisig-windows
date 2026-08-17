import { VaultAllKeyShares } from '@vultisig/core-mpc/vault/Vault'
import { attempt } from '@vultisig/lib-utils/attempt'

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
 * Whether the stored state is missing a passcode sample the active passcode
 * should fill in — either none is stored beside sealed shares, or the stored
 * one still uses the legacy KDF. Answers `false` when no passcode is in play,
 * so it can never turn the lock on for someone who has not set one.
 */
export const needsPasscodeSample = ({
  vaults,
  encryptedSample,
}: PasscodeLockState): boolean =>
  encryptedSample === null
    ? vaults.some(vaultKeySharesArePasscodeEncrypted)
    : isLegacyEncryptedPasscodeBlob(encryptedSample)

type VerifyPasscodeInput = PasscodeLockState & {
  passcode: string
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
