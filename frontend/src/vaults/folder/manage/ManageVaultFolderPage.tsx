import { useNavigate } from 'react-router-dom';

import { makeAppPath } from '../../../navigation';
import { PageContent } from '../../../ui/page/PageContent';
import { PageFooter } from '../../../ui/page/PageFooter';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { FinishEditing } from '../../components/FinishEditing';
import { AddVaultsToFolder } from '../../manage/AddVaultsToFolder';
import { useCurrentVaultFolder } from '../state/currentVaultFolder';
import { DeleteVaultFolder } from './DeleteVaultFolder';
import { ManageFolderVaults } from './ManageFolderVaults';

export const ManageVaultFolderPage = () => {
  const navigate = useNavigate();
  const { id, name } = useCurrentVaultFolder();

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
      <PageContent scrollable gap={20}>
        <ManageFolderVaults />
        <AddVaultsToFolder />
      </PageContent>
      <PageFooter>
        <DeleteVaultFolder />
      </PageFooter>
    </>
  );
};
