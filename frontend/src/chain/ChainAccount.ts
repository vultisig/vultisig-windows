import { ChainEntity } from './ChainEntity';

export type ChainAccount = ChainEntity & {
  address: string;
};
