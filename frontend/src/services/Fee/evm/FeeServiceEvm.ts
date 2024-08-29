/* eslint-disable */

import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { FeeGasInfo, getDefaultGasInfo } from '../../../model/gas-info';
import { IService } from '../../IService';
import { ServiceFactory } from '../../ServiceFactory';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceEvm extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<FeeGasInfo> {
    const service: IService = ServiceFactory.getService(
      this.chain,
      this.walletCore
    );

    try {
      const gasInfo = await service.rpcService.getGasInfo(coin);

      return {
        gasPrice: this.weiToGwei(gasInfo.gasPrice),
        priorityFee: gasInfo.priorityFee,
        nonce: gasInfo.nonce,
        fee: gasInfo.fee,
      };
    } catch (ex) {
      console.error('Failed to get EVM balance, error: ', ex);
      return getDefaultGasInfo();
    }
  }

  private weiToGwei(wei: number): number {
    const gwei = wei / Math.pow(10, 9);
    return gwei;
  }
}
