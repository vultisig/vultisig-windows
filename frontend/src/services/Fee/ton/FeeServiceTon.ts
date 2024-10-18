import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificTon } from '../../../model/specific-transaction-info';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceTon extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificTon> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);
    try {
      const specificTransactionInfo =
        (await rpcService.getSpecificTransactionInfo(coin)) as SpecificTon;
      specificTransactionInfo.gasPrice = 1000000 / Math.pow(10, coin.decimals);
      return specificTransactionInfo;
    } catch (ex) {
      console.error('Failed to get SOLANA fee, error: ', ex);
      return {} as SpecificTon;
    }
  }
}
