import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ListAddButton } from '../../../lib/ui/list/ListAddButton';
import { makeAppPath } from '../../../navigation';

export const ManageVaultChainsPrompt = () => {
  const { t } = useTranslation();
  return (
    <Link to={makeAppPath('manageVaultChains')}>
      <ListAddButton as="div">{t('choose_chains')}</ListAddButton>
    </Link>
  );
};
