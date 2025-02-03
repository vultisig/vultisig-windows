import { Coin } from '@core/communication/vultisig/keysign/v1/coin_pb';

export interface IRpcService {
  getBalance(coin: Coin): Promise<string>;
}
