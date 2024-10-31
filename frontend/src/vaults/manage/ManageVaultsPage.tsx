import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Hoverable } from '../../lib/ui/base/Hoverable';
import { Text } from '../../lib/ui/text';
import { makeAppPath } from '../../navigation';
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderToggleTitle } from '../../ui/page/PageHeaderToggleTitle';
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
        title={
          <PageHeaderToggleTitle
            value={true}
            onChange={() => {
              navigate(makeAppPath('vault'));
            }}
          >
            {t('vaults')}
          </PageHeaderToggleTitle>
        }
      />
      <PageContent>
        <ManageVaults />
      </PageContent>
    </>
  );
};
