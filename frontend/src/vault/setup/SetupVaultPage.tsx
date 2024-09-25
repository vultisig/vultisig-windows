import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { StepTransition } from '../../lib/ui/base/StepTransition';
import { VStack } from '../../lib/ui/layout/Stack';
import { SetupVaultView } from '../../pages/setupVault/SetupVaultView';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { useGenerateVaultName } from './hooks/useGenerateVaultName';
import { SetupVaultNameStep } from './SetupVaultNameStep';
import { VaultNameProvider } from './state/vaultName';

export const SetupVaultPage = () => {
  const { t } = useTranslation();

  const generateVaultName = useGenerateVaultName();
  const initialVaultName = useMemo(generateVaultName, [generateVaultName]);

  return (
    <VaultNameProvider initialValue={initialVaultName}>
      <VStack flexGrow>
        <StepTransition
          from={({ onForward }) => (
            <>
              <PageHeader
                title={
                  <PageHeaderTitle>{t('name_your_vault')}</PageHeaderTitle>
                }
                primaryControls={<PageHeaderBackButton />}
              />
              <SetupVaultNameStep onForward={onForward} />
            </>
          )}
          to={SetupVaultView}
        />
      </VStack>
    </VaultNameProvider>
  );
};
