import { fromBinary } from '@bufbuild/protobuf';
import { VaultSchema } from '@core/communication/vultisig/vault/v1/vault_pb';
import { fromBase64 } from '@lib/utils/fromBase64';
import { pipe } from '@lib/utils/pipe';
import { useMutation } from '@tanstack/react-query';

import { storage } from '../../../../wailsjs/go/models';
import { OnFinishProp, ValueProp } from '../../../lib/ui/props';
import { decryptVault } from '../../encryption/decryptVault';
import { toStorageVault } from '../../utils/storageVault';
import { DecryptVaultView } from './DecryptVaultView';

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
          decryptVault({
            password,
            vault,
          }),
        v => new Uint8Array(v),
        binary => fromBinary(VaultSchema, binary),
        toStorageVault
      ),
    onSuccess: onFinish,
  });

  return (
    <DecryptVaultView isPending={isPending} error={error} onSubmit={mutate} />
  );
};
