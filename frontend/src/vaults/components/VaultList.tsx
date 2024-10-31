import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { storage } from '../../../wailsjs/go/models';
import { Button } from '../../lib/ui/buttons/Button';
import { UnstyledButton } from '../../lib/ui/buttons/UnstyledButton';
import { verticalPadding } from '../../lib/ui/css/verticalPadding';
import { PlusIcon } from '../../lib/ui/icons/PlusIcon';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { makeAppPath } from '../../navigation';
import { pageConfig } from '../../ui/page/config';
import { PageSlice } from '../../ui/page/PageSlice';
import { useVaults } from '../../vault/queries/useVaultsQuery';
import { useCurrentVaultId } from '../../vault/state/useCurrentVaultId';
import { getStorageVaultId } from '../../vault/utils/storageVault';
import { VaultListOption } from './VaultListOption';

const Container = styled(VStack)`
  flex: 1;
  ${verticalPadding(pageConfig.verticalPadding)};
`;

export const VaultList = () => {
  const [, setSelectedVault] = useCurrentVaultId();
  const vaults = useVaults();

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleVaultSelect = (vault: storage.Vault) => {
    setSelectedVault(getStorageVaultId(vault));
    navigate(makeAppPath('vault'));
  };

  return (
    <Container>
      <ScrollableFlexboxFiller>
        <PageSlice gap={16}>
          {vaults.map((vault, index) => (
            <UnstyledButton
              key={index}
              onClick={() => handleVaultSelect(vault)}
            >
              <VaultListOption title={vault.name} />
            </UnstyledButton>
          ))}
        </PageSlice>
      </ScrollableFlexboxFiller>
      <PageSlice>
        <VStack gap={20}>
          <Button
            onClick={() => {
              navigate(makeAppPath('setupVault', {}));
            }}
            kind="primary"
          >
            <HStack alignItems="center" gap={8}>
              <PlusIcon /> {t('add_new_vault')}
            </HStack>
          </Button>
          <Button
            onClick={() => {
              navigate(makeAppPath('importVault'));
            }}
            kind="outlined"
          >
            {t('import_existing_vault')}
          </Button>
        </VStack>
      </PageSlice>
    </Container>
  );
};
