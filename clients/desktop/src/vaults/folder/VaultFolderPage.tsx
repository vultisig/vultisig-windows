import { EditIcon } from '../../lib/ui/icons/EditIcon';
import { VStack } from '../../lib/ui/layout/Stack';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { useFolderVaults } from '../../vault/queries/useVaultsQuery';
import { CurrentVaultProvider } from '../../vault/state/currentVault';
import { getStorageVaultId } from '../../vault/utils/storageVault';
import { VaultListItem } from '../components/VaultListItem';
import { useCurrentVaultFolder } from './state/currentVaultFolder';

export const VaultFolderPage = () => {
  const navigate = useAppNavigate();
  const { id, name } = useCurrentVaultFolder();

  const vaults = useFolderVaults(id);

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={
          <PageHeaderBackButton onClick={() => navigate('vaults')} />
        }
        secondaryControls={
          <PageHeaderIconButton
            icon={<EditIcon />}
            onClick={() => navigate('manageVaultFolder', { params: { id } })}
          />
        }
        title={<PageHeaderTitle>{name}</PageHeaderTitle>}
      />
      <PageContent scrollable>
        <VStack gap={8}>
          {vaults.map(vault => (
            <CurrentVaultProvider value={vault} key={getStorageVaultId(vault)}>
              <VaultListItem />
            </CurrentVaultProvider>
          ))}
        </VStack>
      </PageContent>
    </>
  );
};
