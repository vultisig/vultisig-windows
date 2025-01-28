import { useMutation } from '@tanstack/react-query';

import { storage } from '../../../../wailsjs/go/models';
import {
  ComponentWithValueProps,
  ValueFinishProps,
} from '../../../lib/ui/props';
import { DecryptVaultView } from './DecryptVaultView';

export const DecryptVaultStep = ({
  value,
  onFinish,
}: ComponentWithValueProps<ArrayBuffer> & ValueFinishProps<storage.Vault>) => {
  const { mutate, error, isPending } = useMutation({
    mutationFn: async (password: string) => {
      throw new Error(`Not implemented: ${password}, ${value}`);
    },
    onSuccess: onFinish,
  });

  return (
    <DecryptVaultView isPending={isPending} error={error} onSubmit={mutate} />
  );
};
