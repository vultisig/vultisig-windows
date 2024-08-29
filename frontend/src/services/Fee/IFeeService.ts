/* eslint-disable */
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { FeeGasInfo } from '../../model/gas-info';

export interface IFeeService {
  getFee(coin: Coin): Promise<FeeGasInfo>;
}
