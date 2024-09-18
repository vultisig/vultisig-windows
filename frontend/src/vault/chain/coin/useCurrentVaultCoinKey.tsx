import { CoinKey } from '../../../coin/Coin';
import { useAppPathParams } from '../../../navigation/hooks/useRouteParams';

export const useCurrentVaultCoinKey = (): CoinKey => {
  const { chain, coin } = useAppPathParams<'vaultChainCoinDetail'>();

  return {
    chainId: chain,
    id: coin,
  };
};
