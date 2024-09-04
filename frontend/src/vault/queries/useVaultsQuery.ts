import { useQuery } from '@tanstack/react-query';
import { GetVaults } from '../../../wailsjs/go/storage/Store';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';

export const useVaultsQuery = () => {
  return useQuery({
    queryKey: ['vaults'],
    queryFn: GetVaults,
  });
};

export const useVaults = () => {
  const { data } = useVaultsQuery();
  if (!data || data.length === 0) {
    return [];
  }
  return shouldBePresent(data);
};
