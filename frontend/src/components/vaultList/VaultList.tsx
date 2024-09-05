import React from 'react';
import { storage } from '../../../wailsjs/go/models';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { HStack, VStack } from '../../lib/ui/layout/Stack';
import { PageSlice } from '../../ui/page/PageSlice';
import styled from 'styled-components';
import { verticalPadding } from '../../lib/ui/css/verticalPadding';
import { pageConfig } from '../../ui/page/config';
import { VaultListOption } from '../../vault/list/VaultListOption';
import { Button } from '../../lib/ui/buttons/Button';
import { PlusIcon } from '../../lib/ui/icons/PlusIcon';
import { useVaults } from '../../vault/queries/useVaultsQuery';
import { useCurrentVaultId } from '../../vault/state/useCurrentVaultId';
import { getStorageVaultId } from '../../vault/utils/storageVault';

interface VaultListProps {
  onFinish: () => void;
}

const Container = styled(VStack)`
  flex: 1;
  ${verticalPadding(pageConfig.verticalPadding)};
`;

export const VaultList: React.FC<VaultListProps> = ({ onFinish }) => {
  const [, setSelectedVault] = useCurrentVaultId();
  const vaults = useVaults();

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleVaultSelect = (vault: storage.Vault) => {
    setSelectedVault(getStorageVaultId(vault));
    onFinish();
  };

  return (
    <Container>
      <ScrollableFlexboxFiller>
        <PageSlice gap={16}>
          {vaults.map((vault, index) => (
            <VaultListOption
              key={index}
              name={vault.name}
              onClick={() => handleVaultSelect(vault)}
            />
          ))}
        </PageSlice>
      </ScrollableFlexboxFiller>
      <PageSlice>
        <Button
          onClick={() => {
            navigate('/vault/setup');
          }}
          kind="primary"
        >
          <HStack alignItems="center" gap={8}>
            <PlusIcon /> {t('add_new_vault')}
          </HStack>
        </Button>
      </PageSlice>
    </Container>
  );
};
