import { assertChainField } from '../../../chain/utils/assertChainField';
import { broadcastUtxoTransaction } from '../../../chain/utxo/blockchair/broadcastUtxoTransaction';
import { getUtxoAddressInfo } from '../../../chain/utxo/blockchair/getUtxoAddressInfo';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { UtxoChain } from '../../../model/chain';
import { IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServiceUtxo extends RpcService implements IRpcService {
  async getBalance(coin: Coin): Promise<string> {
    const { data } = await getUtxoAddressInfo(assertChainField(coin));
    return data[coin.address].address.balance.toString();
  }

  async broadcastTransaction(tx: string): Promise<string> {
    return broadcastUtxoTransaction({
      chain: this.chain as UtxoChain,
      tx,
    });
  }
}
