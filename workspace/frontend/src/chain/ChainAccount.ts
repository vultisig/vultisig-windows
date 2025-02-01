import { Chain } from '../model/chain';
import { ChainEntity } from './ChainEntity';

export type ChainAccount<T extends Chain = Chain> = ChainEntity<T> & {
  address: string;
};
