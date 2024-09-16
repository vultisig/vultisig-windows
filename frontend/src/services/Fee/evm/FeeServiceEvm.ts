/* eslint-disable */

import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificEvm } from '../../../model/specific-transaction-info';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceEvm extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificEvm> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);
    try {
      let specificTransactionInfo = (await rpcService.getSpecificTransactionInfo(
        coin
      )) as SpecificEvm;
      specificTransactionInfo.gasPrice = this.weiToGwei(specificTransactionInfo.gasPrice);
      return specificTransactionInfo;
    } catch (ex) {
      console.error('Failed to get EVM balance, error: ', ex);
      return {} as SpecificEvm;
    }
  }

  private weiToGwei(wei: number): number {
    const gwei = wei / Math.pow(10, 9);
    return gwei;
  }
}
