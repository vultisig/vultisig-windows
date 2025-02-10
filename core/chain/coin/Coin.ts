import { ChainEntity } from "../ChainEntity";

export type Coin = ChainEntity & {
  priceProviderId?: string;
};
