import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../lib/ui/buttons/Button';
import { makeAppPath } from '../../navigation';
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt';
import { PageContent } from '../../ui/page/PageContent';
import { PageFooter } from '../../ui/page/PageFooter';
import { PageHeader } from '../../ui/page/PageHeader';
import { FinishEditing } from '../components/FinishEditing';
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
          <FinishEditing onClick={() => navigate(makeAppPath('vaults'))} />
        }
        title={<VaultsPageHeaderTitle />}
      />
      <PageContent scrollable gap={20}>
        <ManageVaultFolders />
        <ManageVaults />
      </PageContent>
      <PageFooter>
        <Button
          kind="outlined"
          onClick={() => navigate(makeAppPath('createVaultFolder'))}
        >
          {t('create_folder')}
        </Button>
      </PageFooter>
    </>
  );
};
