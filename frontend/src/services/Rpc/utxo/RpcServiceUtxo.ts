import { assertChainField } from '../../../chain/utils/assertChainField';
import { getUtxoAddressInfo } from '../../../chain/utxo/blockchair/getUtxoAddressInfo';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { IRpcService } from '../IRpcService';

export class RpcServiceUtxo implements IRpcService {
  async getBalance(coin: Coin): Promise<string> {
    const { data } = await getUtxoAddressInfo(assertChainField(coin));
    return data[coin.address].address.balance.toString();
  }
}
