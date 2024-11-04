import { useNavigate } from 'react-router-dom';

import { MenuIcon } from '../../lib/ui/icons/MenuIcon';
import { makeAppPath } from '../../navigation';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';

export const PageHeaderVaultSettingsPrompt = () => {
  const navigate = useNavigate();

  return (
    <PageHeaderIconButton
      onClick={() => navigate(makeAppPath('vaultSettings'))}
      icon={<MenuIcon />}
    />
  );
};
