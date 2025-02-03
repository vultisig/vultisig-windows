import { getChainEntityIconSrc } from '../../chain/utils/getChainEntityIconSrc';
import { CoinMeta } from '../../model/coin-meta';
import { CoinKey } from '../Coin';

export const getCoinMetaKey = ({
  ticker,
  contractAddress,
  isNativeToken,
  chain,
}: Pick<
  CoinMeta,
  'ticker' | 'contractAddress' | 'isNativeToken' | 'chain'
>): CoinKey => {
  return {
    chain: chain,
    id: isNativeToken ? ticker : contractAddress,
  };
};

export const getCoinMetaIconSrc = (
  coinMeta: Pick<CoinMeta, 'logo'>
): string => {
  if (!coinMeta || !coinMeta.logo) {
    return '';
  }

  if (coinMeta.logo.startsWith('https://')) {
    return coinMeta.logo;
  }
  return getChainEntityIconSrc(coinMeta.logo);
};

export const getCoinMetaSearchStrings = ({
  ticker,
}: Pick<CoinMeta, 'ticker'>): string[] => [ticker];
