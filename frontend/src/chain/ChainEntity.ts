import { Chain } from '../model/chain';

export type ChainEntity<T extends Chain = Chain> = {
  chain: T;
};
