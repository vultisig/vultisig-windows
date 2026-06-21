import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useMutation } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'

import { useCore } from '../../state/core'
import { StorageKey } from '../../storage/StorageKey'
import { useVaults } from '../../storage/vaults'
import { encryptSample } from '../core/sample'
import {
  encryptVaultAllKeyShares,
  mapVaultsKeyShares,
} from '../core/vaultKeyShares'
import { usePasscode } from '../state/passcode'

export const useSetPasscodeMutation = () => {
  const { setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const refetchQueries = useRefetchQueries()
  const vaults = useVaults()
  const [, setPasscode] = usePasscode()

  return useMutation({
    mutationFn: async (passcode: string) => {
      const sample = uuidv4()

      const encryptedSample = await encryptSample({
        key: passcode,
        value: sample,
      })

      const vaultsKeyShares = await mapVaultsKeyShares(vaults, vault =>
        encryptVaultAllKeyShares({
          keyShares: vault.keyShares,
          chainKeyShares: vault.chainKeyShares,
          keyShareMldsa: vault.keyShareMldsa,
          key: passcode,
        })
      )

      await updateVaultsKeyShares(vaultsKeyShares)
      await refetchQueries([StorageKey.vaults])

      setPasscode(passcode)
      await setPasscodeEncryption({
        encryptedSample,
      })
      await refetchQueries([StorageKey.passcodeEncryption])
    },
  })
}
