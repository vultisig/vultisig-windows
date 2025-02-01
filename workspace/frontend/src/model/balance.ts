import { Chain } from './chain';

export type Balance = {
  address: string;
  contractAddress: string | undefined;
  chain: Chain;
  rawAmount: number;
  decimalAmount?: number;
  expiryDate: Date;
};
