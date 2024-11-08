import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { makeAppPath } from '../../navigation';
import { PageHeaderToggleTitle } from '../../ui/page/PageHeaderToggleTitle';

export const VaultsPageHeaderTitle = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PageHeaderToggleTitle
      value={true}
      onChange={() => {
        navigate(makeAppPath('vault'));
      }}
    >
      {t('vaults')}
    </PageHeaderToggleTitle>
  );
};
