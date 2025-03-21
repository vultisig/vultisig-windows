import { fromBinary } from '@bufbuild/protobuf'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { OnFinishProp, ValueProp } from '@lib/ui/props'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { fromBase64 } from '@lib/utils/fromBase64'
import { pipe } from '@lib/utils/pipe'
import { useMutation } from '@tanstack/react-query'

import { storage } from '../../../../wailsjs/go/models'
import { toStorageVault } from '../../utils/storageVault'
import { DecryptVaultView } from './DecryptVaultView'

export const DecryptVaultContainerStep = ({
  value,
  onFinish,
}: ValueProp<string> & OnFinishProp<storage.Vault>) => {
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
        toStorageVault
      ),
    onSuccess: onFinish,
  })

  return (
    <DecryptVaultView isPending={isPending} error={error} onSubmit={mutate} />
  )
}
