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
    chainId: chain,
    id: isNativeToken ? ticker : contractAddress,
  };
};

export const getCoinMetaIconSrc = (
  coinMeta: Pick<CoinMeta, 'ticker'>
): string => getChainEntityIconSrc(coinMeta.ticker);

export const getCoinMetaSearchStrings = ({
  ticker,
  contractAddress,
}: Pick<CoinMeta, 'ticker' | 'contractAddress'>): string[] => [
  ticker,
  contractAddress,
];
