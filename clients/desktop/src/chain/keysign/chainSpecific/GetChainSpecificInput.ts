import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';

export type GetChainSpecificInput<T = any> = {
  coin: Coin;
  receiver?: string;
  feeSettings?: T;
  isDeposit?: boolean;
  amount?: number;
};
