import { usePasscodeEncryption } from '@core/ui/storage/passcodeEncryption'
import { useVaults } from '@core/ui/storage/vaults'
import { useEffect, useRef } from 'react'

import { isPasscodeRequired, needsPasscodeSample } from '../core/passcodeLock'
import { vaultKeySharesNeedPasscodeUpgrade } from '../core/vaultKeyShares'
import { useUpgradePasscodeEncryptionMutation } from '../mutations/useUpgradePasscodeEncryptionMutation'
import { usePasscode } from '../state/passcode'

/**
 * Reconciles passcode encryption once the vault is unlocked: re-encrypts legacy
 * `SHA-256(passcode)` shares and sample with the strong PBKDF2 cipher, and
 * writes back a proof an interrupted passcode write left missing. Renders
 * nothing.
 */
export const PasscodeEncryptionUpgrade = () => {
  const [passcode] = usePasscode()
  const passcodeEncryption = usePasscodeEncryption()
  const vaults = useVaults()
  const { mutate, isPending } = useUpgradePasscodeEncryptionMutation()

  // Attempt once per upgrade episode: if the mutation fails (corrupt blob,
  // storage error), `shouldUpgrade` stays true and `isPending` flips back to
  // false — without this guard the effect would re-fire in a tight loop.
  const attempted = useRef(false)

  const lockState = {
    vaults,
    encryptedSample: passcodeEncryption?.encryptedSample ?? null,
  }

  const shouldUpgrade =
    !!passcode &&
    isPasscodeRequired(lockState) &&
    (vaults.some(vaultKeySharesNeedPasscodeUpgrade) ||
      needsPasscodeSample(lockState))

  useEffect(() => {
    if (!shouldUpgrade) {
      attempted.current = false
      return
    }

    if (!isPending && !attempted.current) {
      attempted.current = true
      mutate()
    }
  }, [shouldUpgrade, isPending, mutate])

  return null
}
