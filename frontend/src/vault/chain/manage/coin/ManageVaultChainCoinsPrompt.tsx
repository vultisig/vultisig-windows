import { Link } from 'react-router-dom';
import { ComponentWithValueProps } from '../../../../lib/ui/props';
import { Chain } from '../../../../model/chain';
import { ListAddButton } from '../../../../lib/ui/list/ListAddButton';

export const ManageVaultChainCoinsPrompt = ({
  value,
}: ComponentWithValueProps<Chain>) => {
  return (
    <Link to={`/vault/chains/${value}`}>
      <ListAddButton as="div">Choose Coins</ListAddButton>
    </Link>
  );
};
