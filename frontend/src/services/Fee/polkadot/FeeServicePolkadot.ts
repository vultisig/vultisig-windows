/* eslint-disable */

import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { FeeGasInfo, getDefaultGasInfo } from '../../../model/gas-info';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServicePolkadot extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<FeeGasInfo> {
    return getDefaultGasInfo();
  }
}
