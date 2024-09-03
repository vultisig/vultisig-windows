/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificSui } from '../../../model/gas-info';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceSui extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificSui> {
    return {} as SpecificSui;
  }
}
