import { Link } from 'react-router-dom';

import { ListAddButton } from '../../../lib/ui/list/ListAddButton';
import { makeAppPath } from '../../../navigation';

export const ManageVaultChainsPrompt = () => {
  return (
    <Link to={makeAppPath('manageVaultChains')}>
      <ListAddButton as="div">Choose Chains</ListAddButton>
    </Link>
  );
};
