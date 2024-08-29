/* eslint-disable */
import { FeeGasInfo } from '../../model/gas-info';

export interface IFeeService {
  getFee(): Promise<FeeGasInfo>;
}
