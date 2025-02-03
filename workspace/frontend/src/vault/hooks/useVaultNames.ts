import { useMemo } from 'react';

import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates';
import { useVaults } from '../queries/useVaultsQuery';

export const useVaultNames = () => {
  const vaults = useVaults();

  return useMemo(() => withoutDuplicates(vaults.map(v => v.name)), [vaults]);
};
