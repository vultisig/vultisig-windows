import { useMutation } from '@tanstack/react-query';

import { UpdateVaultFolderOrder } from '../../../../wailsjs/go/storage/Store';
import { useInvalidateQueries } from '../../../lib/ui/query/hooks/useInvalidateQueries';
import { vaultFoldersQueryKey } from '../../folders/queries/useVaultFoldersQuery';

type Input = {
  id: string;
  order: number;
};

export const useUpdateVaultFolderOrderMutation = () => {
  const invalidate = useInvalidateQueries();

  return useMutation({
    mutationFn: ({ id, order }: Input) => UpdateVaultFolderOrder(id, order),
    onSuccess: () => {
      invalidate(vaultFoldersQueryKey);
    },
  });
};
