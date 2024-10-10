import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificPolkadot } from '../../../model/specific-transaction-info';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServicePolkadot extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificPolkadot> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);
    try {
      const specificTransactionInfo =
        (await rpcService.getSpecificTransactionInfo(coin)) as SpecificPolkadot;
      return specificTransactionInfo;
    } catch (ex) {
      console.error('Failed to get POLKADOT fee, error: ', ex);
      return {} as SpecificPolkadot;
    }
  }
}
