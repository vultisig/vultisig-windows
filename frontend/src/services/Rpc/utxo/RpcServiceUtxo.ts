import { assertChainField } from '../../../chain/utils/assertChainField';
import { getUtxoAddressInfo } from '../../../chain/utxo/blockchair/getUtxoAddressInfo';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { Endpoint } from '../../Endpoint';
import { IRpcService } from '../IRpcService';
import { RpcService } from '../RpcService';

export class RpcServiceUtxo extends RpcService implements IRpcService {
  async getBalance(coin: Coin): Promise<string> {
    const { data } = await getUtxoAddressInfo(assertChainField(coin));
    return data[coin.address].address.balance.toString();
  }

  async sendTransaction(encodedTransaction: string): Promise<string> {
    return await this.broadcastTransaction(encodedTransaction);
  }

  async broadcastTransaction(hex: string): Promise<string> {
    const url = Endpoint.blockchairBroadcast(this.chain.toLowerCase());

    const request = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: hex }),
    });

    const response = await request.json();

    return response.data.transaction_hash;
  }
}
