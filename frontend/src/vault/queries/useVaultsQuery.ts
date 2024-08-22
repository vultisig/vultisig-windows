import { useQuery } from '@tanstack/react-query';
import { GetVaults } from '../../../wailsjs/go/storage/Store';

export const useVaultsQuery = () => {
  return useQuery({
    queryKey: ['vaults'],
    queryFn: GetVaults,
  });
};
