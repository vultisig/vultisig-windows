import { AccountCoin } from '../../../coin/Coin';

export type GetChainSpecificInput<T = any> = {
  coin: AccountCoin;
  receiver?: string;
  feeSettings?: T;
  isDeposit?: boolean;
  amount?: number;
};
