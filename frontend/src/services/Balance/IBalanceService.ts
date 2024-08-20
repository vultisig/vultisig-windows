import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Balance } from '../../model/balance';

export interface IBalanceService {
  getBalance(coin: Coin): Promise<Balance>;
}
