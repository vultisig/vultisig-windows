/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificCosmos } from '../../../model/specific-transaction-info';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceCosmos extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificCosmos> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);
    try {
      let specificTransactionInfo =
        (await rpcService.getSpecificTransactionInfo(coin)) as SpecificCosmos;
      return specificTransactionInfo;
    } catch (ex) {
      console.error('Failed to get EVM balance, error: ', ex);
      return {} as SpecificCosmos;
    }
  }
}
