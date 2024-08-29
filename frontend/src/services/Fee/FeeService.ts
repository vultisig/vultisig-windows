/* eslint-disable */

import { FeeGasInfo } from '../../model/gas-info';
import { IFeeService } from './IFeeService';

export class FeeService implements IFeeService {
  getFee(): Promise<FeeGasInfo> {
    throw new Error('Method not implemented.');
  }
}
