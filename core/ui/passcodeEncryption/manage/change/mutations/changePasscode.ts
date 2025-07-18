import { encryptSample } from '@core/ui/passcodeEncryption/core/sample'
import {
  decryptVaultKeyShares,
  encryptVaultKeyShares,
} from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { recordMap } from '@lib/utils/record/recordMap'
import { useMutation } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'

export const useChangePasscodeMutation = () => {
  const { setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const invalidateQueries = useInvalidateQueries()
  const vaults = useVaults()
  const [oldPasscode, setPasscode] = usePasscode()

  return useMutation({
    mutationFn: async (newPasscode: string) => {
      const key = shouldBePresent(oldPasscode, 'passcode')
      const sample = uuidv4()

      const encryptedSample = encryptSample({
        key: newPasscode,
        value: sample,
      })

      const vaultsKeyShares = recordMap(
        recordFromItems(vaults, getVaultId),
        ({ keyShares }) => {
          const decryptedKeyShares = decryptVaultKeyShares({
            key,
            keyShares,
          })
          return encryptVaultKeyShares({
            key: newPasscode,
            keyShares: decryptedKeyShares,
          })
        }
      )

      await updateVaultsKeyShares(vaultsKeyShares)
      await invalidateQueries([StorageKey.vaults])

      setPasscode(newPasscode)
      await setPasscodeEncryption({
        encryptedSample,
      })
      await invalidateQueries([StorageKey.passcodeEncryption])
    },
  })
}
