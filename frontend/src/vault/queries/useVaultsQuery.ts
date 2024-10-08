import { useQuery } from '@tanstack/react-query';

import { GetVaults } from '../../../wailsjs/go/storage/Store';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';

export const vaultsQueryKey = ['vaults'];

export const useVaultsQuery = () => {
  return useQuery({
    queryKey: vaultsQueryKey,
    queryFn: async () => {
      const result = await GetVaults();
      if (result === null) {
        return [];
      }

      return result;
    },
  });
};

export const useVaults = () => {
  const { data } = useVaultsQuery();
  if (!data || data.length === 0) {
    return [];
  }
  return shouldBePresent(data);
};
