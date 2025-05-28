import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { recordFromItems } from '@lib/utils/record/recordFromItems'
import { recordMap } from '@lib/utils/record/recordMap'
import { useMutation } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'

import { useCore } from '../../state/core'
import { StorageKey } from '../../storage/StorageKey'
import { useVaults } from '../../storage/vaults'
import { getVaultId } from '../../vault/Vault'
import {
  decryptedPasscodeEncoding,
  encryptedPasscodeEncoding,
} from '../core/config'
import { encryptVaultKeyShares } from '../core/vaultKeyShares'

export const useSetPasscodeMutation = () => {
  const { setPasscodeEncryption, updateVaultsKeyShares } = useCore()
  const invalidateQueries = useInvalidateQueries()
  const vaults = useVaults()

  return useMutation({
    mutationFn: async (passcode: string) => {
      const sample = uuidv4()

      const encryptedSample = encryptWithAesGcm({
        value: Buffer.from(sample, decryptedPasscodeEncoding),
        key: Buffer.from(passcode, decryptedPasscodeEncoding),
      }).toString(encryptedPasscodeEncoding)

      const vaultsKeyShares = recordMap(
        recordFromItems(vaults, getVaultId),
        ({ keyShares }) => encryptVaultKeyShares({ key: passcode, keyShares })
      )

      await updateVaultsKeyShares(vaultsKeyShares)
      await setPasscodeEncryption({
        sample,
        encryptedSample,
      })

      await invalidateQueries(
        [StorageKey.passcodeEncryption],
        [StorageKey.vaults]
      )
    },
  })
}
