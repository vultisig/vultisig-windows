import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { recordMap } from '@lib/utils/record/recordMap'
import { useMutation } from '@tanstack/react-query'

import { useCore } from '../../state/core'
import { StorageKey } from '../../storage/StorageKey'
import { useVaults } from '../../storage/vaults'
import { getVaultId } from '../../vault/Vault'
import { decryptVaultKeyShares } from '../core/vaultKeyShares'
import { useAssertPasscode, usePasscode } from '../state/passcode'

export const useDisablePasscodeMutation = () => {
  const { setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const invalidateQueries = useInvalidateQueries()
  const [, setPasscode] = usePasscode()
  const passcode = useAssertPasscode()
  const vaults = useVaults()

  return useMutation({
    mutationFn: async () => {
      const vaultsKeyShares = recordMap(
        recordFromItems(vaults, getVaultId),
        ({ keyShares }) => decryptVaultKeyShares({ key: passcode, keyShares })
      )

      await updateVaultsKeyShares(vaultsKeyShares)
      setPasscode(null)
      await setPasscodeEncryption(null)

      await invalidateQueries(
        [StorageKey.passcodeEncryption],
        [StorageKey.vaults]
      )
    },
  })
}
