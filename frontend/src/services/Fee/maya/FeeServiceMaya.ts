/* eslint-disable */

import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificThorchain } from '../../../model/specific-transaction-info';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceMaya extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificThorchain> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);
    try {
      let specificTransactionInfo =
        (await rpcService.getSpecificTransactionInfo(
          coin
        )) as SpecificThorchain;
      specificTransactionInfo.gasPrice =
        specificTransactionInfo.gasPrice / 1e10;
      return specificTransactionInfo;
    } catch (ex) {
      console.error('Failed to get EVM balance, error: ', ex);
      return {} as SpecificThorchain;
    }
  }
}
