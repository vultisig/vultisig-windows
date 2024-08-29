/* eslint-disable */

import { FeeGasInfo } from '../../../model/gas-info';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceThorchain extends FeeService implements IFeeService {
  getFee(): Promise<FeeGasInfo> {
    throw new Error('Method not implemented.');
  }
}
