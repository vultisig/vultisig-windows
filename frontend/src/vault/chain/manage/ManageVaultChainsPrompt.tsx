import { Link } from 'react-router-dom';

import { ListAddButton } from '../../../lib/ui/list/ListAddButton';

export const ManageVaultChainsPrompt = () => {
  return (
    <Link to="/vault/chains">
      <ListAddButton as="div">Choose Chains</ListAddButton>
    </Link>
  );
};
