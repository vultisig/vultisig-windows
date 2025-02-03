import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { withoutUndefined } from '@lib/utils/array/withoutUndefined';
import { SetupVaultType } from '../setup/type/SetupVaultType';
import { useVaultNames } from './useVaultNames';

export const useGenerateVaultName = (vaultType: SetupVaultType) => {
  const { t } = useTranslation();

  const vaultNames = useVaultNames();

  return useCallback(() => {
    const prefix = `${t(vaultType)} ${t('vault')} #`;

    const vaultNamePattern = new RegExp(`^${prefix}(\\d+)$`);
    const vaultNumbers = withoutUndefined(
      vaultNames.map(name => {
        const match = name.match(vaultNamePattern);
        return match ? parseInt(match[1], 10) : undefined;
      })
    );

    const nextNumber = Math.max(...vaultNumbers, 0) + 1;

    return `${prefix}${nextNumber}`;
  }, [t, vaultNames, vaultType]);
};
