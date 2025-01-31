import { useMemo } from 'react';

import { ChildrenProp } from '../../../lib/ui/props';
import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';
import { useGenerateVaultName } from '../../hooks/useGenerateVaultName';
import { useVaultType } from '../shared/state/vaultType';

export const { useState: useVaultName, provider: VaultNameProvider } =
  getStateProviderSetup<string>('VaultName');

export const SetupVaultNameProvider: React.FC<ChildrenProp> = ({
  children,
}) => {
  const type = useVaultType();
  const generateVaultName = useGenerateVaultName(type);
  const intitialValue = useMemo(generateVaultName, [generateVaultName]);

  return (
    <VaultNameProvider initialValue={intitialValue}>
      {children}
    </VaultNameProvider>
  );
};
