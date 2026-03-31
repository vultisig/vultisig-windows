import { fromBinary } from '@bufbuild/protobuf'
import { DecryptVaultView } from '@core/ui/vault/import/components/DecryptVaultView'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { useMutation } from '@tanstack/react-query'
import { fromCommVault } from '@vultisig/core-mpc/types/utils/commVault'
import { VaultSchema } from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_pb'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { decryptWithAesGcm } from '@vultisig/lib-utils/encryption/aesGcm/decryptWithAesGcm'
import { fromBase64 } from '@vultisig/lib-utils/fromBase64'
import { pipe } from '@vultisig/lib-utils/pipe'

export const DecryptVaultContainerStep = ({
  value,
  onFinish,
}: ValueProp<string> & OnFinishProp<Vault>) => {
  const mutation = useMutation({
    mutationFn: async (password: string) =>
      pipe(
        value,
        fromBase64,
        vault =>
          decryptWithAesGcm({
            key: password,
            value: vault,
          }),
        v => new Uint8Array(v),
        binary => fromBinary(VaultSchema, binary),
        fromCommVault,
        vault => ({ ...vault, isBackedUp: true })
      ),
    onSuccess: onFinish,
  })

  return <DecryptVaultView mutation={mutation} />
}
