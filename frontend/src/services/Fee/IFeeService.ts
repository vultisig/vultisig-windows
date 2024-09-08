import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificTransactionInfo } from '../../model/specific-transaction-info';

export interface IFeeService {
  getFee(coin: Coin): Promise<SpecificTransactionInfo>;
}
