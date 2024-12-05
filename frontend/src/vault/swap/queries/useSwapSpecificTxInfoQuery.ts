import { useSpecificTxInfoQuery } from '../../../coin/query/useSpecificTxInfoQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useFromCoin } from '../state/fromCoin';

export const useSwapSpecificTxInfoQuery = () => {
  const [fromCoin] = useFromCoin();
  const coin = useCurrentVaultCoin(fromCoin);

  return useSpecificTxInfoQuery({
    coin: storageCoinToCoin(coin),
  });
};
