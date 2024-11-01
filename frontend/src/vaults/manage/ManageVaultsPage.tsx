import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Hoverable } from '../../lib/ui/base/Hoverable';
import { Button } from '../../lib/ui/buttons/Button';
import { Text } from '../../lib/ui/text';
import { makeAppPath } from '../../navigation';
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { VaultGroupsContainer } from '../components/VaultGroupsContainer';
import { VaultsPageHeaderTitle } from '../components/VaultsPageHeaderTitle';
import { ManageVaultFolders } from '../folders/manage/ManageVaultFolders';
import { ManageVaults } from './ManageVaults';

export const ManageVaultsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        hasBorder
        primaryControls={<PageHeaderVaultSettingsPrompt />}
        secondaryControls={
          <Hoverable onClick={() => navigate(makeAppPath('vaults'))}>
            <Text color="contrast" size={14} weight="600">
              {t('done')}
            </Text>
          </Hoverable>
        }
        title={<VaultsPageHeaderTitle />}
      />
      <PageContent>
        <VaultGroupsContainer>
          <ManageVaultFolders />
          <ManageVaults />
        </VaultGroupsContainer>
        <Button
          kind="outlined"
          onClick={() => navigate(makeAppPath('createVaultFolder'))}
        >
          {t('create_folder')}
        </Button>
      </PageContent>
    </>
  );
};
