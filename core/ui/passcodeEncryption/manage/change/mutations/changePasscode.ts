import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { usePresentState } from '@lib/ui/state/usePresentState'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { recordMap } from '@lib/utils/record/recordMap'
import { useMutation } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'

import { useCore } from '../../../../state/core'
import { StorageKey } from '../../../../storage/StorageKey'
import { useVaults } from '../../../../storage/vaults'
import { getVaultId } from '../../../../vault/Vault'
import { encryptSample } from '../../../core/sample'
import {
  decryptVaultKeyShares,
  encryptVaultKeyShares,
} from '../../../core/vaultKeyShares'
import { usePasscode } from '../../../state/passcode'

export const useChangePasscodeMutation = () => {
  const { setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const invalidateQueries = useInvalidateQueries()
  const vaults = useVaults()
  const [oldPasscode, setPasscode] = usePresentState(usePasscode())

  return useMutation({
    mutationFn: async (newPasscode: string) => {
      const sample = uuidv4()

      const encryptedSample = encryptSample({
        key: newPasscode,
        value: sample,
      })

      const vaultsKeyShares = recordMap(
        recordFromItems(vaults, getVaultId),
        ({ keyShares }) => {
          const decryptedKeyShares = decryptVaultKeyShares({
            key: oldPasscode,
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
