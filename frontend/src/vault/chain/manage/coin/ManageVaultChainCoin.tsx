import { getCoinMetaIconSrc } from '../../../../coin/utils/coinMeta';
import { ComponentWithValueProps } from '../../../../lib/ui/props';
import { CoinMeta } from '../../../../model/coin-meta';
import { ChainEntityIcon } from '../../../../chain/ui/ChainEntityIcon';
import { ManageVaultCoin } from '../ManageVaultCoin';

export const ManageVaultChainCoin = ({
  value,
}: ComponentWithValueProps<CoinMeta>) => {
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
