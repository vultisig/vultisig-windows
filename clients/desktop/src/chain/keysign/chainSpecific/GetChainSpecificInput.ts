import { AccountCoin } from '@core/chain/coin/AccountCoin';

export type GetChainSpecificInput<T = any> = {
  coin: AccountCoin;
  receiver?: string;
  feeSettings?: T;
  isDeposit?: boolean;
  amount?: number;
};
