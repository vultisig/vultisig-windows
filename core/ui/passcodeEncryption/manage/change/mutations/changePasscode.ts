import { encryptSample } from '@core/ui/passcodeEncryption/core/sample'
import {
  decryptVaultAllKeyShares,
  encryptVaultAllKeyShares,
  mapVaultsKeyShares,
} from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useVaults } from '@core/ui/storage/vaults'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { v4 as uuidv4 } from 'uuid'

export const useChangePasscodeMutation = () => {
  const { setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const refetchQueries = useRefetchQueries()
  const vaults = useVaults()
  const [oldPasscode, setPasscode] = usePasscode()

  return useMutation({
    mutationFn: async (newPasscode: string) => {
      const key = shouldBePresent(oldPasscode, 'passcode')
      const sample = uuidv4()

      const encryptedSample = await encryptSample({
        key: newPasscode,
        value: sample,
      })

      const vaultsKeyShares = await mapVaultsKeyShares(vaults, async vault => {
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
      })

      await updateVaultsKeyShares(vaultsKeyShares)
      await refetchQueries([StorageKey.vaults])

      setPasscode(newPasscode)
      await setPasscodeEncryption({
        encryptedSample,
      })
      await refetchQueries([StorageKey.passcodeEncryption])
    },
  })
}
