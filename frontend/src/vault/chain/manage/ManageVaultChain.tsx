import { ChainEntityIcon } from '../../../chain/ui/ChainEntityIcon';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { getChainPrimaryCoin } from '../../../chain/utils/getChainPrimaryCoin';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { Chain } from '../../../model/chain';
import { ManageVaultCoin } from './ManageVaultCoin';

export const ManageVaultChain = ({ value }: ComponentWithValueProps<Chain>) => {
  const coin = getChainPrimaryCoin(value);

  return (
    <ManageVaultCoin
      value={coin}
      icon={
        <ChainEntityIcon
          value={getChainEntityIconSrc(value)}
          style={{ fontSize: 32 }}
        />
      }
    />
  );
};
