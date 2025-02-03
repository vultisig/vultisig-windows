import { ChainEntityIcon } from '../../../../chain/ui/ChainEntityIcon';
import { getCoinMetaIconSrc } from '../../../../coin/utils/coinMeta';
import { ValueProp } from '../../../../lib/ui/props';
import { CoinMeta } from '../../../../model/coin-meta';
import { ManageVaultCoin } from '../ManageVaultCoin';

export const ManageVaultChainCoin = ({ value }: ValueProp<CoinMeta>) => {
  return (
    <ManageVaultCoin
      value={value}
      icon={
        <ChainEntityIcon
          value={getCoinMetaIconSrc(value)}
          style={{ fontSize: 32 }}
        />
      }
    />
  );
};
