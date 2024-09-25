import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { withoutDuplicates } from '../../../lib/utils/array/withoutDuplicates';
import { withoutUndefined } from '../../../lib/utils/array/withoutUndefined';
import { useVaults } from '../../queries/useVaultsQuery';

export const useGenerateVaultName = () => {
  const vaults = useVaults();
  const { t } = useTranslation();

  const vaultNames = useMemo(
    () => withoutDuplicates(vaults.map(v => v.name)),
    [vaults]
  );

  return useCallback(() => {
    const vaultNamePattern = new RegExp(`^${t('vault')} #(\\d+)$`);
    const vaultNumbers = withoutUndefined(
      vaultNames.map(name => {
        const match = name.match(vaultNamePattern);
        return match ? parseInt(match[1], 10) : undefined;
      })
    );

    const nextNumber = Math.max(...vaultNumbers, 0) + 1;

    return `${t('vault')} #${nextNumber}`;
  }, [t, vaultNames]);
};
