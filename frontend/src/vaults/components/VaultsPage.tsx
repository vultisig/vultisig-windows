import { useNavigate } from 'react-router-dom';

import { EditIcon } from '../../lib/ui/icons/EditIcon';
import { makeAppPath } from '../../navigation';
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { VaultFolders } from '../folders/components/VaultFolders';
import { ManageVaultCreation } from './ManageVaultCreation';
import { VaultGroupsContainer } from './VaultGroupsContainer';
import { Vaults } from './Vaults';
import { VaultsPageHeaderTitle } from './VaultsPageHeaderTitle';

export const VaultsPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderVaultSettingsPrompt />}
        secondaryControls={
          <PageHeaderIconButton
            icon={<EditIcon />}
            onClick={() => navigate(makeAppPath('manageVaults'))}
          />
        }
        title={<VaultsPageHeaderTitle />}
      />
      <PageContent>
        <VaultGroupsContainer>
          <VaultFolders />
          <Vaults />
        </VaultGroupsContainer>
        <ManageVaultCreation />
      </PageContent>
    </>
  );
};
