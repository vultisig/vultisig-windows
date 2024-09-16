/* eslint-disable */
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { SpecificUtxo } from '../../../model/specific-transaction-info';
import { RpcServiceFactory } from '../../Rpc/RpcServiceFactory';
import { FeeService } from '../FeeService';
import { IFeeService } from '../IFeeService';

export class FeeServiceUtxo extends FeeService implements IFeeService {
  async getFee(coin: Coin): Promise<SpecificUtxo> {
    const rpcService = RpcServiceFactory.createRpcService(this.chain);
    try {
      let specificTransactionInfo = (await rpcService.getSpecificTransactionInfo(
        coin
      )) as SpecificUtxo;
      return specificTransactionInfo;
    } catch (ex) {
      console.error('Failed to get UTXO transaction info, error: ', ex);
      return {} as SpecificUtxo;
    }
  }
}
