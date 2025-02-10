import { ChainEntityIcon } from '../../../../chain/ui/ChainEntityIcon';
import { Coin } from '../../../../coin/Coin';
import { getCoinLogoSrc } from '../../../../coin/logo/getCoinLogoSrc';
import { ValueProp } from '../../../../lib/ui/props';
import { ManageVaultCoin } from '../ManageVaultCoin';

export const ManageVaultChainCoin = ({ value }: ValueProp<Coin>) => {
  return (
    <ManageVaultCoin
      value={value}
      icon={
        <ChainEntityIcon
          value={getCoinLogoSrc(value.logo)}
          style={{ fontSize: 32 }}
        />
      }
    />
  );
};
