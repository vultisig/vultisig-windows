import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { recordMap } from '@lib/utils/record/recordMap'
import { useMutation } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'

import { useCore } from '../../state/core'
import { StorageKey } from '../../storage/StorageKey'
import { useVaults } from '../../storage/vaults'
import { getVaultId } from '../../vault/Vault'
import { encryptSample } from '../core/sample'
import { encryptVaultKeyShares } from '../core/vaultKeyShares'
import { usePasscode } from '../state/passcode'

export const useSetPasscodeMutation = () => {
  const { setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const invalidateQueries = useInvalidateQueries()
  const vaults = useVaults()
  const [, setPasscode] = usePasscode()

  return useMutation({
    mutationFn: async (passcode: string) => {
      const sample = uuidv4()

      const encryptedSample = encryptSample({
        key: passcode,
        value: sample,
      })

      const vaultsKeyShares = recordMap(
        recordFromItems(vaults, getVaultId),
        ({ keyShares }) => encryptVaultKeyShares({ key: passcode, keyShares })
      )

      await updateVaultsKeyShares(vaultsKeyShares)
      await invalidateQueries([StorageKey.vaults])

      setPasscode(passcode)
      await setPasscodeEncryption({
        encryptedSample,
      })
      await invalidateQueries([StorageKey.passcodeEncryption])
    },
  })
}
