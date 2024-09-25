import { useMemo } from 'react';

import { StepTransition } from '../../lib/ui/base/StepTransition';
import { VStack } from '../../lib/ui/layout/Stack';
import { SetupVaultView } from '../../pages/setupVault/SetupVaultView';
import { useGenerateVaultName } from '../hooks/useGenerateVaultName';
import { SetupVaultNameStep } from './SetupVaultNameStep';
import { VaultNameProvider } from './state/vaultName';

export const SetupVaultPage = () => {
  const generateVaultName = useGenerateVaultName();
  const initialVaultName = useMemo(generateVaultName, [generateVaultName]);

  return (
    <VaultNameProvider initialValue={initialVaultName}>
      <VStack flexGrow>
        <StepTransition from={SetupVaultNameStep} to={SetupVaultView} />
      </VStack>
    </VaultNameProvider>
  );
};
