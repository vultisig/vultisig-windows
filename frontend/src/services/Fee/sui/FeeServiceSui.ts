/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificSui } from '../../../model/specific-transaction-info';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceSui extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificSui> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);
    try {
      const specificTransactionInfo =
        (await rpcService.getSpecificTransactionInfo(coin)) as SpecificSui;
      return specificTransactionInfo;
    } catch (ex) {
      console.error('Failed to get SUI fee, error: ', ex);
      return {} as SpecificSui;
    }
  }
}
