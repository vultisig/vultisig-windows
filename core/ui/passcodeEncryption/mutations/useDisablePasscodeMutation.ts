import { withPasscodeOperationLock } from '@core/ui/passcodeEncryption/core/passcodeAttemptThrottle'
import {
  decryptVaultAllKeyShares,
  mapVaultsKeyShares,
} from '@core/ui/passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

export const useDisablePasscodeMutation = () => {
  const { getVaults, setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const refetchQueries = useRefetchQueries()
  const [passcode, setPasscode] = usePasscode()

  return useMutation({
    mutationFn: async () =>
      withPasscodeOperationLock(async () => {
        const key = shouldBePresent(passcode, 'passcode')
        const vaults = await getVaults()

        const vaultsKeyShares = await mapVaultsKeyShares({
          vaults,
          transform: vault =>
            decryptVaultAllKeyShares({
              key,
              keyShares: vault.keyShares,
              chainKeyShares: vault.chainKeyShares,
              keyShareMldsa: vault.keyShareMldsa,
            }),
        })

        await updateVaultsKeyShares(vaultsKeyShares)
        await refetchQueries([StorageKey.vaults])
        setPasscode(null)
        await setPasscodeEncryption(null)
        await refetchQueries([StorageKey.passcodeEncryption])
      }),
  })
}
