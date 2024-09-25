import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { withoutUndefined } from '../../lib/utils/array/withoutUndefined';
import { useVaultNames } from './useVaultNames';

export const useGenerateVaultName = () => {
  const { t } = useTranslation();

  const vaultNames = useVaultNames();

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
