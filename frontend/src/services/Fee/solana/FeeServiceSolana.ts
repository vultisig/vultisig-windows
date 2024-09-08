/* eslint-disable */

import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificSolana } from '../../../model/specific-transaction-info';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceSolana extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificSolana> {
    return {} as SpecificSolana;
  }
}
