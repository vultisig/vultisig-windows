import { useCore } from '@core/ui/state/core'
import { usePasscodeEncryption } from '@core/ui/storage/passcodeEncryption'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useVaults } from '@core/ui/storage/vaults'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { v4 as uuidv4 } from 'uuid'

import { encryptSample } from '../core/sample'
import {
  decryptVaultAllKeyShares,
  encryptVaultAllKeyShares,
  isLegacyEncryptedPasscodeBlob,
  mapVaultsKeyShares,
  vaultKeySharesNeedPasscodeUpgrade,
} from '../core/vaultKeyShares'
import { usePasscode } from '../state/passcode'

/**
 * Re-encrypts passcode-protected data still using the legacy `SHA-256(passcode)`
 * KDF (key shares and the passcode sample) with the strong PBKDF2 cipher. Runs
 * once after unlock; vaults/sample already on the new format are skipped, so it
 * is a no-op once everything is upgraded.
 */
export const useUpgradePasscodeEncryptionMutation = () => {
  const { updateVaultsKeyShares, setPasscodeEncryption } = useCore()
  const refetchQueries = useRefetchQueries()
  const [passcode] = usePasscode()
  const passcodeEncryption = usePasscodeEncryption()
  const vaults = useVaults()

  return useMutation({
    mutationFn: async () => {
      const key = shouldBePresent(passcode, 'passcode')
      const { encryptedSample } = shouldBePresent(passcodeEncryption)

      const legacyVaults = vaults.filter(vaultKeySharesNeedPasscodeUpgrade)

      if (legacyVaults.length > 0) {
        const vaultsKeyShares = await mapVaultsKeyShares(
          legacyVaults,
          async vault => {
            const decrypted = await decryptVaultAllKeyShares({
              key,
              keyShares: vault.keyShares,
              chainKeyShares: vault.chainKeyShares,
              keyShareMldsa: vault.keyShareMldsa,
            })
            return encryptVaultAllKeyShares({ ...decrypted, key })
          }
        )

        await updateVaultsKeyShares(vaultsKeyShares)
        await refetchQueries([StorageKey.vaults])
      }

      if (isLegacyEncryptedPasscodeBlob(encryptedSample)) {
        await setPasscodeEncryption({
          encryptedSample: await encryptSample({ key, value: uuidv4() }),
        })
        await refetchQueries([StorageKey.passcodeEncryption])
      }
    },
  })
}
