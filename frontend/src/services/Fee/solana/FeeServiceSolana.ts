import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificSolana } from '../../../model/specific-transaction-info';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceSolana extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificSolana> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);
    try {
      const gasInfo = (await rpcService.getSpecificTransactionInfo(coin)) as SpecificSolana;
      gasInfo.gasPrice = 1000000 / Math.pow(10, 9);
      return gasInfo;
    } catch (ex) {
      console.error('Failed to get SOLANA fee, error: ', ex);
      return {} as SpecificSolana;
    }
  }
}
