import { fromBinary } from '@bufbuild/protobuf'
import { fromCommVault } from '@core/mpc/types/utils/commVault'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { DecryptVaultView } from '@core/ui/vault/import/components/DecryptVaultView'
import { Vault } from '@core/ui/vault/Vault'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { fromBase64 } from '@lib/utils/fromBase64'
import { pipe } from '@lib/utils/pipe'
import { useMutation } from '@tanstack/react-query'

export const DecryptVaultContainerStep = ({
  value,
  onFinish,
}: ValueProp<string> & OnFinishProp<Vault>) => {
  const { mutate, error, isPending } = useMutation({
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

  return (
    <DecryptVaultView isPending={isPending} error={error} onSubmit={mutate} />
  )
}
