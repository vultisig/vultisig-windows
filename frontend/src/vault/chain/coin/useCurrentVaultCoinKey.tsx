import { useParams } from 'react-router-dom';
import { CoinKey } from '../../../coin/Coin';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { useCurrentVaultChainId } from '../useCurrentVaultChainId';

export const useCurrentVaultCoinKey = (): CoinKey => {
  const chainId = useCurrentVaultChainId();

  const { coin } = useParams<{ coin: string }>();

  return {
    chainId,
    id: shouldBePresent(coin),
  };
};
