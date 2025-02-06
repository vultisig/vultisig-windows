import { getRippleAccountInfo } from '../../chain/ripple/account/getRippleAccountInfo';
import { CoinBalanceResolver } from './CoinBalanceResolver';

export const getRippleCoinBalance: CoinBalanceResolver = async input => {
  const { Balance } = await getRippleAccountInfo(input.address);

  return BigInt(Balance);
};
