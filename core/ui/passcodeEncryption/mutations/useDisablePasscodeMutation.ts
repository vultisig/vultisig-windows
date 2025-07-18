import { decryptVaultKeyShares } from '@core/ui/passcodeEncryption/core/vaultKeyShares'
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

export const useDisablePasscodeMutation = () => {
  const { setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const invalidateQueries = useInvalidateQueries()
  const [passcode, setPasscode] = usePasscode()
  const vaults = useVaults()

  return useMutation({
    mutationFn: async () => {
      const key = shouldBePresent(passcode, 'passcode')

      const vaultsKeyShares = recordMap(
        recordFromItems(vaults, getVaultId),
        ({ keyShares }) => decryptVaultKeyShares({ key, keyShares })
      )

      await updateVaultsKeyShares(vaultsKeyShares)
      await invalidateQueries([StorageKey.vaults])
      setPasscode(null)
      await setPasscodeEncryption(null)
      await invalidateQueries([StorageKey.passcodeEncryption])
    },
  })
}
