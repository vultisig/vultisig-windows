import { useNavigate } from 'react-router-dom';

import { EditIcon } from '../../lib/ui/icons/EditIcon';
import { VStack } from '../../lib/ui/layout/Stack';
import { makeAppPath } from '../../navigation';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { useFolderVaults } from '../../vault/queries/useVaultsQuery';
import { getStorageVaultId } from '../../vault/utils/storageVault';
import { VaultListItem } from '../components/VaultListItem';
import { useCurrentVaultFolder } from './state/currentVaultFolder';

export const VaultFolderPage = () => {
  const navigate = useNavigate();
  const { id, name } = useCurrentVaultFolder();

  const vaults = useFolderVaults(id);

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderBackButton />}
        secondaryControls={
          <PageHeaderIconButton
            icon={<EditIcon />}
            onClick={() => navigate(makeAppPath('manageVaultFolder', { id }))}
          />
        }
        title={<PageHeaderTitle>{name}</PageHeaderTitle>}
      />
      <PageContent scrollable>
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
