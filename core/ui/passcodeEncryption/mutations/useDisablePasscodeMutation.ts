import {
  decryptVaultAllKeyShares,
  mapVaultsKeyShares,
} from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useVaults } from '@core/ui/storage/vaults'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

export const useDisablePasscodeMutation = () => {
  const { setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const refetchQueries = useRefetchQueries()
  const [passcode, setPasscode] = usePasscode()
  const vaults = useVaults()

  return useMutation({
    mutationFn: async () => {
      const key = shouldBePresent(passcode, 'passcode')

      const vaultsKeyShares = await mapVaultsKeyShares(vaults, vault =>
        decryptVaultAllKeyShares({
          key,
          keyShares: vault.keyShares,
          chainKeyShares: vault.chainKeyShares,
          keyShareMldsa: vault.keyShareMldsa,
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
