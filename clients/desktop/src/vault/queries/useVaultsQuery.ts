import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { GetVaults } from '../../../wailsjs/go/storage/Store';

export const vaultsQueryKey = ['vaults'];

export const vaultsQueryFn = async () => {
  const result = await GetVaults();

  if (result === null) {
    return [];
  }

  return sortEntitiesWithOrder(result);
};

export const useVaultsQuery = () => {
  return useQuery({
    queryKey: vaultsQueryKey,
    queryFn: vaultsQueryFn,
  });
};

export const useVaults = () => {
  const { data } = useVaultsQuery();
  if (!data || data.length === 0) {
    return [];
  }
  console.log('data', data);
  return shouldBePresent(data);
};

export const useFolderlessVaults = () => {
  const vaults = useVaults();

  return useMemo(() => vaults.filter(({ folder_id }) => !folder_id), [vaults]);
};

export const useFolderVaults = (folderId: string) => {
  const vaults = useVaults();

  return useMemo(
    () => vaults.filter(({ folder_id }) => folder_id === folderId),
    [vaults, folderId]
  );
};
