import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { useMutation } from '@tanstack/react-query'

import { useCore } from '../../state/core'
import { StorageKey } from '../../storage/StorageKey'
import { useVaults } from '../../storage/vaults'
import { getVaultId, VaultKeyShares } from '../../vault/Vault'
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
      const vaultsRecord = recordFromItems(vaults, getVaultId)
      const vaultEntries = Object.entries(vaultsRecord)

      const decryptedEntries = await Promise.all(
        vaultEntries.map(async ([vaultId, vault]) => {
          const decryptedKeyShares = await decryptVaultKeyShares({
            key: passcode,
            keyShares: vault.keyShares,
          })
          return [vaultId, decryptedKeyShares]
        })
      )

      const vaultsKeyShares = Object.fromEntries(decryptedEntries) as Record<
        string,
        VaultKeyShares
      >

      await updateVaultsKeyShares(vaultsKeyShares)
      await invalidateQueries([StorageKey.vaults])

      setPasscode(null)
      await setPasscodeEncryption(null)
      await invalidateQueries([StorageKey.passcodeEncryption])
    },
  })
}
