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
        await setPasscodeEncryption(null)
        await refetchQueries(
          [StorageKey.vaults],
          [StorageKey.passcodeEncryption]
        )

        // Last, and only once both halves of `isPasscodeRequired` have been
        // refetched. Dropping the passcode any earlier leaves a commit where a
        // passcode is still required but none is held, which is exactly the
        // state PasscodeGuard locks on — the lock screen would flash over the
        // settings page for a frame before the refetches landed.
        setPasscode(null)
      }),
  })
}
