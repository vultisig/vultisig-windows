/* eslint-disable */

import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificCosmos } from '../../../model/specific-transaction-info';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceCosmos extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificCosmos> {
    return {} as SpecificCosmos;
  }
}
