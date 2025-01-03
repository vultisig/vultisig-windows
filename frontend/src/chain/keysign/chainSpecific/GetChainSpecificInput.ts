import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';

export type GetChainSpecificInput<T = any> = {
  coin: Coin;
  receiver?: string;
  feeSettings?: T;
  isDeposit?: boolean;
  sendMaxAmount?: boolean;
};
