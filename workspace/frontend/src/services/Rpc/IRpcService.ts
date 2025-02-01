import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';

export interface IRpcService {
  getBalance(coin: Coin): Promise<string>;
}
