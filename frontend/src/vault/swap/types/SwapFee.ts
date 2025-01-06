import { CoinAmount, CoinKey } from '../../../coin/Coin';

export type SwapFee = CoinKey & CoinAmount;

export type SwapFees = {
  network: SwapFee;
  swap?: SwapFee;
};
