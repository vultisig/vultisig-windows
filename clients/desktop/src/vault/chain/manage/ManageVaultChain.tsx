import { ChainEntityIcon } from '../../../chain/ui/ChainEntityIcon';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { chainFeeCoin } from '../../../coin/chainFeeCoins';
import { ValueProp } from '../../../lib/ui/props';
import { Chain } from '@core/chain/Chain';
import { ManageVaultCoin } from './ManageVaultCoin';

export const ManageVaultChain = ({ value }: ValueProp<Chain>) => {
  const coin = chainFeeCoin[value];

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
