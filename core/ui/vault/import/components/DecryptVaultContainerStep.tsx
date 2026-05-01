import { fromBinary } from '@bufbuild/protobuf'
import { DecryptVaultView } from '@core/ui/vault/import/components/DecryptVaultView'
import { normalizeImportedCommVault } from '@core/ui/vault/import/utils/normalizeImportedCommVault'
import { VaultBackupPasswordError } from '@core/ui/vault/import/utils/VaultBackupPasswordError'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { useMutation } from '@tanstack/react-query'
import { fromCommVault } from '@vultisig/core-mpc/types/utils/commVault'
import { VaultSchema } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_pb'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { attempt } from '@vultisig/lib-utils/attempt'
import { decryptWithAesGcm } from '@vultisig/lib-utils/encryption/aesGcm/decryptWithAesGcm'
import { fromBase64 } from '@vultisig/lib-utils/fromBase64'

export const DecryptVaultContainerStep = ({
  value,
  onFinish,
}: ValueProp<string> & OnFinishProp<Vault>) => {
  const mutation = useMutation({
    mutationFn: async (password: string) => {
      const ciphertext = fromBase64(value)
      const decrypted = attempt(() =>
        decryptWithAesGcm({ key: password, value: ciphertext })
      )
      if ('error' in decrypted) {
        throw new VaultBackupPasswordError()
      }

      const commVault = normalizeImportedCommVault(
        fromBinary(VaultSchema, new Uint8Array(decrypted.data))
      )
      return { ...fromCommVault(commVault), isBackedUp: true }
    },
    onSuccess: onFinish,
  })

  return <DecryptVaultView mutation={mutation} />
}
