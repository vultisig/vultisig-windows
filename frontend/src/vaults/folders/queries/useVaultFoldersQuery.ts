import { useQuery } from '@tanstack/react-query';

import { GetVaultFolders } from '../../../../wailsjs/go/storage/Store';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { sortEntitiesWithOrder } from '../../../lib/utils/entities/EntityWithOrder';

export const vaultFoldersQueryKey = ['vaultFolders'];

export const vaultFoldersQueryFn = async () => {
  const result = await GetVaultFolders();

  if (result === null) {
    return [];
  }

  return sortEntitiesWithOrder(result);
};

export const useVaultFoldersQuery = () => {
  return useQuery({
    queryKey: vaultFoldersQueryKey,
    queryFn: vaultFoldersQueryFn,
  });
};

export const useVaultFolders = () => {
  const { data } = useVaultFoldersQuery();
  if (!data || data.length === 0) {
    return [];
  }
  return shouldBePresent(data);
};
