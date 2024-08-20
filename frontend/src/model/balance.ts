import { Chain } from './chain';

export type Balance = {
  address: string;
  contractAddress: string | undefined;
  chain: Chain;
  rawAmount: number;
};
