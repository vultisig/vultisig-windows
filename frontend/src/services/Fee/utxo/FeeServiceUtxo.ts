/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificUtxo } from '../../../model/gas-info';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceUtxo extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificUtxo> {
    return {} as SpecificUtxo;
  }
}
