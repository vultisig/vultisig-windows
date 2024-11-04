import { useNavigate } from 'react-router-dom';

import { VStack } from '../../../lib/ui/layout/Stack';
import { makeAppPath } from '../../../navigation';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { useFolderVaults } from '../../../vault/queries/useVaultsQuery';
import { getStorageVaultId } from '../../../vault/utils/storageVault';
import { FinishEditing } from '../../components/FinishEditing';
import { VaultListItem } from '../../components/VaultListItem';
import { useCurrentVaultFolder } from '../state/currentVaultFolder';

export const ManageVaultFolderPage = () => {
  const navigate = useNavigate();
  const { id, name } = useCurrentVaultFolder();

  const vaults = useFolderVaults(id);

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <FinishEditing
            onClick={() => navigate(makeAppPath('vaultFolder', { id }))}
          />
        }
        title={<PageHeaderTitle>{name}</PageHeaderTitle>}
      />
      <PageContent>
        <VStack gap={8}>
          {vaults.map((vault, index) => (
            <VaultListItem
              key={index}
              id={getStorageVaultId(vault)}
              name={vault.name}
            />
          ))}
        </VStack>
      </PageContent>
    </>
  );
};
