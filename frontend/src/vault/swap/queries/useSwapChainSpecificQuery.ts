import { useChainSpecificQuery } from '../../../coin/query/useChainSpecificQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useFromCoin } from '../state/fromCoin';

export const useSwapChainSpecificQuery = () => {
  const [fromCoin] = useFromCoin();
  const coin = useCurrentVaultCoin(fromCoin);

  return useChainSpecificQuery({
    coin: storageCoinToCoin(coin),
    // receiver is only required for Solana which swaps do not support
    receiver: '',
  });
};
