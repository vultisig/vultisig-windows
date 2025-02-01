import { EditIcon } from '../../lib/ui/icons/EditIcon';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt';
import { PageContent } from '../../ui/page/PageContent';
import { PageFooter } from '../../ui/page/PageFooter';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { VaultFolders } from '../folders/components/VaultFolders';
import { ManageVaultCreation } from './ManageVaultCreation';
import { Vaults } from './Vaults';
import { VaultsPageHeaderTitle } from './VaultsPageHeaderTitle';

export const VaultsPage = () => {
  const navigate = useAppNavigate();

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderVaultSettingsPrompt />}
        secondaryControls={
          <PageHeaderIconButton
            icon={<EditIcon />}
            onClick={() => navigate('manageVaults')}
          />
        }
        title={<VaultsPageHeaderTitle />}
      />
      <PageContent scrollable gap={20}>
        <VaultFolders />
        <Vaults />
      </PageContent>
      <PageFooter>
        <ManageVaultCreation />
      </PageFooter>
    </>
  );
};
