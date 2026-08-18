import { passcodeEncryptionConfig } from '@core/ui/passcodeEncryption/core/config'
import { withPasscodeOperationLock } from '@core/ui/passcodeEncryption/core/passcodeAttemptThrottle'
import { assertValidNewPasscode } from '@core/ui/passcodeEncryption/core/passcodePolicy'
import { encryptSample } from '@core/ui/passcodeEncryption/core/sample'
import {
  decryptVaultAllKeyShares,
  encryptVaultAllKeyShares,
  mapVaultsKeyShares,
} from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { v4 as uuidv4 } from 'uuid'

export const useChangePasscodeMutation = () => {
  const {
    getPasscodeEncryption,
    getVaults,
    setPasscodeEncryption,
    updateVaultsKeyShares,
  } = useCore()
  const refetchQueries = useRefetchQueries()
  const [oldPasscode, setPasscode] = usePasscode()

  return useMutation({
    mutationFn: async (newPasscode: string) =>
      withPasscodeOperationLock(async () => {
        assertValidNewPasscode(newPasscode)
        const key = shouldBePresent(oldPasscode, 'passcode')
        const sample = uuidv4()
        const vaults = await getVaults()

        const encryptedSample = await encryptSample({
          key: newPasscode,
          value: sample,
        })

        const vaultsKeyShares = await mapVaultsKeyShares({
          vaults,
          transform: async vault => {
            const decrypted = await decryptVaultAllKeyShares({
              key,
              keyShares: vault.keyShares,
              chainKeyShares: vault.chainKeyShares,
              keyShareMldsa: vault.keyShareMldsa,
            })
            return encryptVaultAllKeyShares({
              ...decrypted,
              key: newPasscode,
            })
          },
        })

        await updateVaultsKeyShares(vaultsKeyShares)
        await refetchQueries([StorageKey.vaults])

        setPasscode(newPasscode)
        const latestPasscodeEncryption = await getPasscodeEncryption()
        await setPasscodeEncryption({
          encryptedSample,
          passcodeLength: passcodeEncryptionConfig.passcodeLength,
          attemptState: latestPasscodeEncryption?.attemptState,
        })
        await refetchQueries([StorageKey.passcodeEncryption])
      }),
  })
}
