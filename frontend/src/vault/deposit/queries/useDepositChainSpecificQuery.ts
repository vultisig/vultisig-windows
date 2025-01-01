import { useChainSpecificQuery } from '../../../coin/query/useChainSpecificQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';

export const useDepositChainSpecificQuery = () => {
  const [coinKey] = useCurrentDepositCoin();
  const coin = useCurrentVaultCoin(coinKey);

  return useChainSpecificQuery({
    coin: storageCoinToCoin(coin),
    isDeposit: true,
  });
};
