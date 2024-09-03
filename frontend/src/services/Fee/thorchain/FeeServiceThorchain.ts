/* eslint-disable */

import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificThorchain } from '../../../model/gas-info';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceThorchain extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificThorchain> {
    return {} as SpecificThorchain;
  }
}
