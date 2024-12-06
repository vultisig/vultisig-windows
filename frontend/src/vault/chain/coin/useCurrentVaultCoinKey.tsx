import { CoinKey } from '../../../coin/Coin';
import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';

export const useCurrentVaultCoinKey = (): CoinKey => {
  const [{ chain, coin }] = useAppPathParams<'vaultChainCoinDetail'>();

  return {
    chain: chain,
    id: coin,
  };
};
