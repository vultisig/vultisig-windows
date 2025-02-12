import { getTonAccountInfo } from '../../chain/ton/account/getTonAccountInfo';
import { CoinBalanceResolver } from './CoinBalanceResolver';

export const getTonCoinBalance: CoinBalanceResolver = async input => {
  const { balance } = await getTonAccountInfo(input.address);

  return BigInt(balance);
};
