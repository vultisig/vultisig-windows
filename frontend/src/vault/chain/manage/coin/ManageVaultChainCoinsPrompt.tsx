import { Link } from 'react-router-dom';

import { ListAddButton } from '../../../../lib/ui/list/ListAddButton';
import { ComponentWithValueProps } from '../../../../lib/ui/props';
import { Chain } from '../../../../model/chain';
import { makeAppPath } from '../../../../navigation';

export const ManageVaultChainCoinsPrompt = ({
  value,
}: ComponentWithValueProps<Chain>) => {
  return (
    <Link to={makeAppPath('manageVaultChainCoins', { chain: value })}>
      <ListAddButton as="div">Choose Coins</ListAddButton>
    </Link>
  );
};
