import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin';
import { Chain } from '@core/chain/Chain';

const ETHTicker = chainFeeCoin[Chain.Ethereum].ticker;
export const shouldDisplayChainLogo = ({
  ticker,
  chain,
  isNative,
}: {
  ticker: string;
  chain: Chain;
  isNative: boolean;
}): boolean => {
  return !isNative || (ticker === ETHTicker && chain !== Chain.Ethereum);
};
