import { ComponentWithValueProps } from '../../../lib/ui/props';
import { Chain } from '../../../model/chain';
import { getChainPrimaryCoin } from '../../../chain/utils/getChainPrimaryCoin';
import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon';
import { getCoinMetaIconSrc } from '../../../coin/utils/coinMeta';
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc';
import { ManageVaultCoin } from './ManageVaultCoin';

export const ManageVaultChain = ({ value }: ComponentWithValueProps<Chain>) => {
  const coin = getChainPrimaryCoin(value);

  return (
    <ManageVaultCoin
      value={coin}
      icon={
        <ChainCoinIcon
          coinSrc={getCoinMetaIconSrc(coin)}
          chainSrc={getChainEntityIconSrc(value)}
          style={{ fontSize: 32 }}
        />
      }
    />
  );
};
