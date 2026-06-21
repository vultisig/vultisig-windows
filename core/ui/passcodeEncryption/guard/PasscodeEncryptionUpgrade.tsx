import { usePasscodeEncryption } from '@core/ui/storage/passcodeEncryption'
import { useVaults } from '@core/ui/storage/vaults'
import { useEffect } from 'react'

import {
  isLegacyEncryptedPasscodeBlob,
  vaultKeySharesNeedPasscodeUpgrade,
} from '../core/vaultKeyShares'
import { useUpgradePasscodeEncryptionMutation } from '../mutations/useUpgradePasscodeEncryptionMutation'
import { usePasscode } from '../state/passcode'

/**
 * Transparently re-encrypts legacy `SHA-256(passcode)` shares and sample with
 * the strong PBKDF2 cipher once the vault is unlocked. Renders nothing.
 */
export const PasscodeEncryptionUpgrade = () => {
  const [passcode] = usePasscode()
  const passcodeEncryption = usePasscodeEncryption()
  const vaults = useVaults()
  const { mutate, isPending } = useUpgradePasscodeEncryptionMutation()

  const shouldUpgrade =
    !!passcode &&
    passcodeEncryption !== null &&
    (vaults.some(vaultKeySharesNeedPasscodeUpgrade) ||
      isLegacyEncryptedPasscodeBlob(passcodeEncryption.encryptedSample))

  useEffect(() => {
    if (shouldUpgrade && !isPending) {
      mutate()
    }
  }, [shouldUpgrade, isPending, mutate])

  return null
}
