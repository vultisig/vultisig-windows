import { getVaultId } from '@core/mpc/vault/Vault'
import { decryptVaultAllKeyShares } from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useVaults } from '@core/ui/storage/vaults'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { recordMap } from '@lib/utils/record/recordMap'
import { useMutation } from '@tanstack/react-query'

export const useDisablePasscodeMutation = () => {
  const { setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const refetchQueries = useRefetchQueries()
  const [passcode, setPasscode] = usePasscode()
  const vaults = useVaults()

  return useMutation({
    mutationFn: async () => {
      const key = shouldBePresent(passcode, 'passcode')

      const vaultsKeyShares = recordMap(
        recordFromItems(vaults, getVaultId),
        ({ keyShares, chainKeyShares, keyShareMldsa }) =>
          decryptVaultAllKeyShares({
            key,
            keyShares,
            chainKeyShares,
            keyShareMldsa,
          })
      )

      await updateVaultsKeyShares(vaultsKeyShares)
      await refetchQueries([StorageKey.vaults])
      setPasscode(null)
      await setPasscodeEncryption(null)
      await refetchQueries([StorageKey.passcodeEncryption])
    },
  })
}
